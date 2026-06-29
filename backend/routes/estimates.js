const express = require('express');
const router = express.Router();
const Estimate = require('../models/Estimate');
const RepairRequest = require('../models/RepairRequest');
const auth = require('../middleware/auth');

// @route   GET api/estimates
// @desc    Get all estimates for the user (customer or technician)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let estimates;
    if (req.user.role === 'admin') {
      estimates = await Estimate.find()
        .populate({
          path: 'repairRequest',
          populate: { path: 'customer', select: 'name email phone' }
        })
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'name email phone' }
        });
    } else if (req.user.role === 'technician') {
      const Technician = require('../models/Technician');
      const technician = await Technician.findOne({ user: req.user.id });
      if (!technician) {
        return res.status(404).json({ msg: 'Technician profile not found' });
      }
      estimates = await Estimate.find({ technician: technician._id })
        .populate({
          path: 'repairRequest',
          populate: { path: 'customer', select: 'name email phone' }
        });
    } else {
      // Customer: find requests first
      const requests = await RepairRequest.find({ customer: req.user.id }).select('_id');
      const requestIds = requests.map(r => r._id);
      estimates = await Estimate.find({ repairRequest: { $in: requestIds } })
        .populate({
          path: 'repairRequest',
          populate: { path: 'customer', select: 'name email phone' }
        })
        .populate({
          path: 'technician',
          populate: { path: 'user', select: 'name email phone' }
        });
    }

    res.json(estimates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/estimates/:id/action
// @desc    Accept or decline an estimate
// @access  Private
router.post('/:id/action', auth, async (req, res) => {
  const { action } = req.body; // 'accept' or 'decline'
  if (!['accept', 'decline'].includes(action)) {
    return res.status(400).json({ msg: 'Action must be accept or decline' });
  }

  try {
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) {
      return res.status(404).json({ msg: 'Estimate not found' });
    }

    estimate.status = action === 'accept' ? 'accepted' : 'declined';
    await estimate.save();

    // Update the linked repair request status
    const request = await RepairRequest.findById(estimate.repairRequest);
    if (request) {
      if (action === 'accept') {
        request.status = 'estimated';
      }
      await request.save();
    }

    res.json(estimate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
