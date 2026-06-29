const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// @route   GET api/technicians
// @desc    Get all technicians (with search/filter query parameters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, city, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    let usersMatchIds = [];
    if (city || search) {
      const User = require('../models/User');
      let userQuery = {};
      if (city) userQuery.city = city;
      if (search) {
        userQuery.name = { $regex: search, $options: 'i' };
      }
      const users = await User.find(userQuery).select('_id');
      usersMatchIds = users.map(u => u._id);
      query.user = { $in: usersMatchIds };
    }

    const technicians = await Technician.find(query)
      .populate('user', 'name email phone city')
      .exec();

    res.json(technicians);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/technicians/:id
// @desc    Get technician by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const technician = await Technician.findById(req.id || req.params.id)
      .populate('user', 'name email phone city')
      .exec();

    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' });
    }

    res.json(technician);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Technician not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/technicians/:id/reviews
// @desc    Get technician reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ technician: req.params.id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .exec();

    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/technicians/:id/reviews
// @desc    Add a review for a technician
// @access  Private
router.post('/:id/reviews', auth, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const technician = await Technician.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({ msg: 'Technician not found' });
    }

    const newReview = new Review({
      technician: req.params.id,
      customer: req.user.id,
      rating,
      comment
    });

    await newReview.save();

    // Re-calculate average rating for technician
    const reviews = await Review.find({ technician: req.params.id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    technician.rating = parseFloat(avgRating.toFixed(1));
    await technician.save();

    res.json(newReview);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
