const express = require('express');
const router = express.Router();
const RepairRequest = require('../models/RepairRequest');
const Estimate = require('../models/Estimate');
const Technician = require('../models/Technician');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// @route   GET api/analytics
// @desc    Retrieve system-wide business analytics
// @access  Private (Admin or authorized business role)
router.get('/', auth, async (req, res) => {
  try {
    // 1. Most requested repair categories
    const categoriesCount = await RepairRequest.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 2. Average repair cost (Accepted estimates)
    const avgCostResult = await Estimate.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: null, avgLabor: { $avg: "$labor" }, avgParts: { $avg: "$parts" }, avgTravel: { $avg: "$travel" } } }
    ]);

    let averages = { labor: 0, parts: 0, travel: 0, total: 0 };
    if (avgCostResult.length > 0) {
      const { avgLabor, avgParts, avgTravel } = avgCostResult[0];
      averages = {
        labor: Math.round(avgLabor),
        parts: Math.round(avgParts),
        travel: Math.round(avgTravel),
        total: Math.round(avgLabor + avgParts + avgTravel)
      };
    }

    // 3. Top artisans by rating
    const topArtisans = await Technician.find()
      .populate('user', 'name city')
      .sort({ rating: -1 })
      .limit(5)
      .exec();

    // 4. Technician utilization (active vs total)
    const totalTechs = await Technician.countDocuments();
    const availableTechs = await Technician.countDocuments({ availability: true });
    const utilizationRate = totalTechs > 0 ? ((totalTechs - availableTechs) / totalTechs) * 100 : 0;

    // 5. Customer satisfaction (Avg rating)
    const satisfactionResult = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    const customerSatisfaction = satisfactionResult.length > 0 ? parseFloat(satisfactionResult[0].avgRating.toFixed(1)) : 5.0;

    // 6. Revenue projections
    const revenueResult = await Estimate.aggregate([
      { $group: {
          _id: "$status",
          total: { $sum: { $add: ["$labor", "$parts", "$travel"] } },
          count: { $sum: 1 }
        }
      }
    ]);

    let revenues = { projected: 0, completed: 0 };
    revenueResult.forEach(item => {
      if (item._id === 'accepted') {
        revenues.completed += item.total;
      }
      revenues.projected += item.total; // all estimates sum
    });

    res.json({
      categories: categoriesCount.map(c => ({ category: c._id || 'Unknown', count: c.count })),
      averages,
      topArtisans: topArtisans.map(t => ({
        id: t._id,
        name: t.user ? t.user.name : 'Unknown',
        category: t.category,
        rating: t.rating,
        city: t.user ? t.user.city : 'Unknown'
      })),
      technicianUtilization: {
        total: totalTechs,
        available: availableTechs,
        utilizationRate: Math.round(utilizationRate)
      },
      customerSatisfaction,
      revenues
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
