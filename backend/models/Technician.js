const mongoose = require('mongoose');

const TechnicianSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'Electricians',
      'Plumbers',
      'Carpenters',
      'Welders',
      'Solar Technicians',
      'AC Technicians',
      'Refrigeration Technicians',
      'Painters',
      'Masons',
      'Appliance Repair Specialists'
    ],
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  availability: {
    type: Boolean,
    default: true
  },
  certifications: [String],
  serviceAreas: [String],
  profileImageUrl: String,
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});

// Index for geo proximity queries
TechnicianSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model('Technician', TechnicianSchema);
