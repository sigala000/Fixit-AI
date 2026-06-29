const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const RepairRequest = require('../models/RepairRequest');
const auth = require('../middleware/auth');

// @route   GET api/appointments
// @desc    Get all appointments for the logged-in user (customer or technician)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'admin') {
      appointments = await Appointment.find()
        .populate({
          path: 'repairRequest',
          populate: { path: 'customer', select: 'name email phone' }
        })
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'name email phone' }
        })
        .sort({ date: 1 });
    } else if (req.user.role === 'technician') {
      const Technician = require('../models/Technician');
      const technician = await Technician.findOne({ user: req.user.id });
      if (!technician) {
        return res.status(404).json({ msg: 'Technician profile not found' });
      }
      appointments = await Appointment.find({ technician: technician._id })
        .populate({
          path: 'repairRequest',
          populate: { path: 'customer', select: 'name email phone' }
        })
        .sort({ date: 1 });
    } else {
      const requests = await RepairRequest.find({ customer: req.user.id }).select('_id');
      const requestIds = requests.map(r => r._id);
      appointments = await Appointment.find({ repairRequest: { $in: requestIds } })
        .populate({
          path: 'repairRequest',
          populate: { path: 'customer', select: 'name email phone' }
        })
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'name email phone' }
        })
        .sort({ date: 1 });
    }

    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/appointments
// @desc    Create a new appointment (when estimate is accepted)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { repairRequestId, date, location } = req.body;
  try {
    const request = await RepairRequest.findById(repairRequestId);
    if (!request) {
      return res.status(404).json({ msg: 'Repair request not found' });
    }

    if (!request.matchedTechnician) {
      return res.status(400).json({ msg: 'Repair request does not have a matched technician' });
    }

    const appointment = new Appointment({
      repairRequest: repairRequestId,
      technician: request.matchedTechnician,
      date: new Date(date),
      location: location || request.city,
      status: 'confirmed'
    });

    await appointment.save();

    // Update request status to scheduled
    request.status = 'scheduled';
    await request.save();

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Private
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    // Revert repair request status
    const request = await RepairRequest.findById(appointment.repairRequest);
    if (request) {
      request.status = 'estimated';
      await request.save();
    }

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
