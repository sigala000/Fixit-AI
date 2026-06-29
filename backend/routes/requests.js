const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const RepairRequest = require('../models/RepairRequest');
const Technician = require('../models/Technician');
const auth = require('../middleware/auth');

// @route   POST api/requests
// @desc    Create a new repair request
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('description', 'Description is required').not().isEmpty(),
      check('city', 'City is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { description, city, imageUrls } = req.body;

    try {
      const newRequest = new RepairRequest({
        customer: req.user.id,
        description,
        city,
        imageUrls: imageUrls || [],
        status: 'intake',
        symptoms: [],
        urgency: 'Medium'
      });

      const request = await newRequest.save();
      res.json(request);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/requests/available
// @desc    Get open (unmatched) requests in the technician's category — "job board"
// @access  Private (technician only)
router.get('/available', auth, async (req, res) => {
  if (req.user.role !== 'technician') {
    return res.status(403).json({ msg: 'Only technicians can access the job board' });
  }
  try {
    const technician = await Technician.findOne({ user: req.user.id });
    if (!technician) return res.status(404).json({ msg: 'Technician profile not found' });

    // Return diagnosed/intake requests in the same category that have no matched technician yet
    const available = await RepairRequest.find({
      category: technician.category,
      matchedTechnician: { $exists: false },
      status: { $in: ['intake', 'diagnosed'] }
    })
      .populate('customer', 'name phone city')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(available);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests
// @desc    Get all requests for the logged-in user (customer or technician)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'admin') {
      requests = await RepairRequest.find()
        .populate('customer', 'name email phone')
        .populate('matchedTechnician')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'technician') {
      // Find technician profile first
      const technician = await Technician.findOne({ user: req.user.id });
      if (!technician) {
        return res.status(404).json({ msg: 'Technician profile not found' });
      }
      requests = await RepairRequest.find({ matchedTechnician: technician._id })
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      requests = await RepairRequest.find({ customer: req.user.id })
        .populate('matchedTechnician')
        .sort({ createdAt: -1 });
    }

    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/requests/:id
// @desc    Get request by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await RepairRequest.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate({
        path: 'matchedTechnician',
        populate: { path: 'user', select: 'name email phone' }
      });

    if (!request) {
      return res.status(404).json({ msg: 'Repair request not found' });
    }

    // Ensure user has access
    if (req.user.role !== 'admin' && request.customer._id.toString() !== req.user.id) {
      if (req.user.role === 'technician') {
        const technician = await Technician.findOne({ user: req.user.id });
        if (!technician || request.matchedTechnician._id.toString() !== technician._id.toString()) {
          return res.status(401).json({ msg: 'Not authorized' });
        }
      } else {
        return res.status(401).json({ msg: 'Not authorized' });
      }
    }

    res.json(request);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Repair request not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/requests/:id/chat
// @desc    Send message to the AI agent for a specific request
// @access  Private
router.post('/:id/chat', auth, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ msg: 'Message is required' });
  }

  const requestId = req.params.id;

  try {
    const request = await RepairRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ msg: 'Repair request not found' });
    }

    // Call ADK agent running on port 8000
    const agentUrl = `${process.env.AGENT_SERVICE_URL || 'http://localhost:8000'}/apps/app/sessions/${requestId}/invocations`;
    
    console.log(`Forwarding message to ADK Agent: ${agentUrl}`);
    
    // Construct standard ADK invocation payload
    const adkPayload = {
      user_message: {
        content: {
          parts: [
            {
              text: `[Context: Request ID ${requestId}, Category: ${request.category || 'Unknown'}, Status: ${request.status}] User says: "${message}"`
            }
          ]
        }
      }
    };

    let agentResponseText = "";
    try {
      const response = await fetch(agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adkPayload)
      });

      if (response.ok) {
        const data = await response.json();
        // Extract agent text response
        if (data && data.event && data.event.content && data.event.content.parts) {
          agentResponseText = data.event.content.parts[0].text;
        } else if (data && data.text) {
          agentResponseText = data.text;
        } else {
          agentResponseText = JSON.stringify(data);
        }
      } else {
        const errText = await response.text();
        console.warn(`ADK Agent responded with error status ${response.status}: ${errText}`);
        throw new Error('Agent service failure');
      }
    } catch (agentError) {
      console.warn("ADK Agent service not running or failed. Running fallback rule-based diagnostic...", agentError);
      
      // Fallback Diagnosis Engine (zero-config out of the box)
      const text = message.toLowerCase();
      let category = request.category;
      let diagnosis = request.diagnosis;
      let urgency = request.urgency;
      let symptoms = request.symptoms;
      let status = request.status;

      if (status === 'intake') {
        // Simple classifier
        if (text.includes('fridge') || text.includes('refrigerator') || text.includes('cooling')) {
          category = 'Refrigeration Technicians';
          diagnosis = "AI Diagnosis: Compressor cycle fault or condenser coil blockage causing cooling failure.";
          urgency = "High";
          symptoms = ["poor cooling", "compressor noise"];
          status = 'diagnosed';
        } else if (text.includes('ac') || text.includes('air conditioner') || text.includes('leak')) {
          category = 'AC Technicians';
          diagnosis = "AI Diagnosis: Clogged condensate drain line or refrigerant leak causing water dripping.";
          urgency = "Medium";
          symptoms = ["dripping water", "reduced airflow"];
          status = 'diagnosed';
        } else if (text.includes('wire') || text.includes('electricity') || text.includes('power') || text.includes('socket')) {
          category = 'Electricians';
          diagnosis = "AI Diagnosis: Overloaded circuit or faulty outlet wiring causing sparks/trips.";
          urgency = "High";
          symptoms = ["sparks", "tripped breaker"];
          status = 'diagnosed';
        } else if (text.includes('pipe') || text.includes('plumb') || text.includes('clog')) {
          category = 'Plumbers';
          diagnosis = "AI Diagnosis: Obstructed main sewer branch or pipe seal degradation.";
          urgency = "Medium";
          symptoms = ["clogged drain", "water pooling"];
          status = 'diagnosed';
        } else if (text.includes('solar') || text.includes('panel') || text.includes('inverter')) {
          category = 'Solar Technicians';
          diagnosis = "AI Diagnosis: Inverter circuit malfunction or faulty charge controller.";
          urgency = "Medium";
          symptoms = ["charge error", "low capacity"];
          status = 'diagnosed';
        } else {
          category = 'Appliance Repair Specialists';
          diagnosis = "AI Diagnosis: Unknown mechanical or electrical component wear.";
          urgency = "Medium";
          symptoms = ["general malfunction"];
          status = 'diagnosed';
        }

        request.category = category;
        request.diagnosis = diagnosis;
        request.urgency = urgency;
        request.symptoms = symptoms;
        request.status = status;
        await request.save();

        agentResponseText = `I have diagnosed your issue. Probable category: **${category}** (${urgency} priority). ${diagnosis} Would you like me to match you with a nearby technician?`;
      } else if (status === 'diagnosed') {
        // Match a technician
        const matchingTechs = await Technician.find({ category: request.category, availability: true })
          .populate('user', 'name city');
        
        let tech = null;
        if (matchingTechs.length > 0) {
          // find in same city or random
          const cityTechs = matchingTechs.filter(t => t.user.city === request.city);
          tech = cityTechs.length > 0 ? cityTechs[0] : matchingTechs[0];
        }

        if (tech) {
          request.matchedTechnician = tech._id;
          request.status = 'matched';
          await request.save();

          agentResponseText = `I have matched you with **${tech.user.name}**, a highly-rated ${request.category} specialist based in ${tech.user.city} (${tech.experience} years experience, Rating: ${tech.rating}★). I am now generating a pricing quote for the repair.`;
          
          // Trigger pricing estimate automatically
          setTimeout(async () => {
            const labor = 8000;
            const parts = 12000;
            const travel = 3000;
            const total = labor + parts + travel;

            const Estimate = require('../models/Estimate');
            const estimate = new Estimate({
              repairRequest: request._id,
              technician: tech._id,
              labor,
              parts,
              travel,
              totalRange: `${total - 1000} FCFA - ${total + 2000} FCFA`
            });
            await estimate.save();

            request.status = 'estimated';
            await request.save();
          }, 1000);
        } else {
          agentResponseText = `I couldn't find an available technician for ${request.category} in your area at the moment. Let me check regional specialists.`;
        }
      } else if (status === 'matched' || status === 'estimated') {
        agentResponseText = `A detailed quotation has been generated. Please review and accept the estimate in the "Estimates" tab to schedule your appointment.`;
      } else if (status === 'scheduled') {
        agentResponseText = `Your appointment is confirmed. The technician will arrive at the scheduled time. Let me know if you need to reschedule or contact support.`;
      } else {
        agentResponseText = `Hello! How can I help you with your repair request today? You can ask about matched technicians, quotes, or scheduling.`;
      }
    }

    res.json({ response: agentResponseText });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
