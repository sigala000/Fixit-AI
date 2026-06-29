const mongoose = require('mongoose');

const RepairRequestSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrls: [String],
  symptoms: [String],
  status: {
    type: String,
    enum: ['intake', 'diagnosed', 'matched', 'estimated', 'scheduled', 'in_progress', 'completed'],
    default: 'intake'
  },
  category: {
    type: String,
    trim: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  diagnosis: String,
  matchedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician'
  },
  city: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RepairRequest', RepairRequestSchema);
