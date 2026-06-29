const mongoose = require('mongoose');

const EstimateSchema = new mongoose.Schema({
  repairRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RepairRequest',
    required: true
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  labor: {
    type: Number,
    required: true
  },
  parts: {
    type: Number,
    required: true
  },
  travel: {
    type: Number,
    required: true
  },
  totalRange: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Estimate', EstimateSchema);
