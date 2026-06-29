require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load models
const User = require('../models/User');
const Technician = require('../models/Technician');
const RepairRequest = require('../models/RepairRequest');
const Estimate = require('../models/Estimate');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Mock data options
const CITIES = ["Douala", "Yaoundé", "Bafoussam", "Kribi", "Limbe", "Garoua", "Bamenda", "Bertoua"];

const CATEGORIES = [
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
];

const FIRST_NAMES = [
  "Boris", "Jean-Pierre", "Dieudonne", "Marie", "Joseph", "Chantal", "Eric", "Fabrice",
  "Samuel", "Alex", "Vincent", "Francis", "Charlotte", "Sally", "Richard", "Emmanuel",
  "Christian", "Blaise", "Serge", "Guy", "Michel", "Patrick", "Gervais", "Olivier",
  "Esther", "Florence", "Therese", "Grace", "Raissa", "Audrey", "Nathalie", "Celine",
  "Alain", "Daniel", "Thomas", "Paul", "Georges", "Simon", "David", "Arthur"
];

const LAST_NAMES = [
  "Talla", "Fotso", "Kamga", "Ngo", "Ewane", "Bella", "Mba", "Ndjock", "Eto'o", "Song",
  "Aboubakar", "Ngannou", "Foe", "Dipanda", "Nyolo", "Bona", "Dibango", "Anguissa",
  "Choupo", "Moting", "Milla", "Mbappe", "Ebolo", "Ntep", "Toko", "Ekambi", "Onana",
  "Zambo", "Kunde", "N'Koulou", "Castletto", "Fai", "Gouet", "Hongla", "Bassogog"
];

const CERTIFICATIONS = [
  "National Vocational Qualification",
  "African Solar Academy Certified",
  "Ministry of Employment Technical Diploma",
  "Yaounde Trade Center Certification",
  "Douala Institute of Technology Certificate",
  "Certified Master Artisan",
  "REDA Certified Technician"
];

// Helper to generate coordinates in Cameroon cities
const CITY_COORDS = {
  "Douala": { lat: 4.0511, lng: 9.7679 },
  "Yaoundé": { lat: 3.8480, lng: 11.5021 },
  "Bafoussam": { lat: 5.4778, lng: 10.4178 },
  "Kribi": { lat: 2.9506, lng: 9.9075 },
  "Limbe": { lat: 4.0135, lng: 9.2205 },
  "Garoua": { lat: 9.3004, lng: 13.3934 },
  "Bamenda": { lat: 5.9631, lng: 10.1591 },
  "Bertoua": { lat: 4.5772, lng: 13.6846 }
};

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateCoords(cityName) {
  const base = CITY_COORDS[cityName] || CITY_COORDS["Douala"];
  // Random offset ~10km
  return {
    lat: base.lat + getRandomRange(-0.05, 0.05),
    lng: base.lng + getRandomRange(-0.05, 0.05)
  };
}

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clean up
    console.log('Cleaning up existing database records...');
    await User.deleteMany({});
    await Technician.deleteMany({});
    await RepairRequest.deleteMany({});
    await Estimate.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleared.');

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create 1 Admin
    const adminUser = new User({
      name: "Fixit Admin",
      email: "admin@fixit.com",
      password: passwordHash,
      role: "admin",
      phone: "+237 677 12 34 56",
      city: "Yaoundé"
    });
    await adminUser.save();
    console.log('Admin created.');

    // Create 15 Customer Users
    const customers = [];
    for (let i = 1; i <= 15; i++) {
      const city = getRandomElement(CITIES);
      const name = `${getRandomElement(FIRST_NAMES)} ${getRandomElement(LAST_NAMES)}`;
      const customer = new User({
        name,
        email: `customer${i}@fixit.com`,
        password: passwordHash,
        role: "customer",
        phone: `+237 699 ${Math.floor(100000 + Math.random() * 900000)}`,
        city
      });
      await customer.save();
      customers.push(customer);
    }
    console.log(`${customers.length} Customers created.`);

    // Create 50 Technicians
    const technicians = [];
    for (let i = 1; i <= 50; i++) {
      const category = getRandomElement(CATEGORIES);
      const city = getRandomElement(CITIES);
      const firstName = getRandomElement(FIRST_NAMES);
      const lastName = getRandomElement(LAST_NAMES);
      const name = `${firstName} ${lastName}`;
      const email = `tech${i}@fixit.com`;

      const user = new User({
        name,
        email,
        password: passwordHash,
        role: "technician",
        phone: `+237 655 ${Math.floor(100000 + Math.random() * 900000)}`,
        city
      });
      await user.save();

      const coords = generateCoords(city);
      const experience = Math.floor(getRandomRange(2, 15));
      const rating = parseFloat(getRandomRange(3.8, 5.0).toFixed(1));

      // Generate mock certifications
      const numCerts = Math.floor(Math.random() * 3);
      const techCerts = [];
      for (let j = 0; j < numCerts; j++) {
        const cert = getRandomElement(CERTIFICATIONS);
        if (!techCerts.includes(cert)) {
          techCerts.push(cert);
        }
      }

      const technician = new Technician({
        user: user._id,
        category,
        experience,
        rating,
        availability: Math.random() > 0.15, // 85% available
        certifications: techCerts,
        serviceAreas: [city, `${city} Center`, `${city} Suburbs`],
        profileImageUrl: `https://images.unsplash.com/photo-${i % 2 === 0 ? '1540569014015-19a7ee504e3a' : '1534528741775-53994a69daeb'}?auto=format&fit=crop&w=150&h=150&q=80`,
        latitude: coords.lat,
        longitude: coords.lng
      });
      await technician.save();
      technicians.push(technician);
    }
    console.log(`${technicians.length} Technicians created.`);

    // Create 100 Repair Requests
    const repairRequests = [];
    const issueDescriptions = {
      'Electricians': [
        "Circuit breaker keeps tripping in the kitchen.",
        "Sparking wall socket in the bedroom.",
        "Total power blackout in the living room only.",
        "Installing new ceiling fans and light fixtures.",
        "Exposed wiring in the backyard garage."
      ],
      'Plumbers': [
        "Water leak under the kitchen sink.",
        "Clogged bathroom toilet overflowing.",
        "Burst pipe in the main yard flooding the grass.",
        "Installing a new water heater.",
        "Low water pressure in all showers."
      ],
      'Carpenters': [
        "Wooden kitchen cabinet door fell off.",
        "Repairing a broken wooden dining table leg.",
        "Roof timber structure damage near the balcony.",
        "Installing custom wooden shelves in the study.",
        "Squeaky wooden stairs need fixing."
      ],
      'Welders': [
        "Broken iron gate hinge needs welding.",
        "Repairing metal security bars on the window.",
        "Welding a cracked metal railing on the staircase.",
        "Building a custom steel support frame.",
        "Reinforcing the warehouse steel security door."
      ],
      'Solar Technicians': [
        "Solar inverter is showing error code E03.",
        "Installing 4 new solar panels on the roof.",
        "Solar batteries not storing charge during the day.",
        "Solar charger controller overheating.",
        "Cleaning solar panels and auditing system."
      ],
      'AC Technicians': [
        "AC is blowing warm air instead of cooling.",
        "Water is dripping from the indoor AC unit.",
        "AC unit is making a very loud rattling sound.",
        "Yearly servicing and freon gas recharge.",
        "AC unit does not turn on at all."
      ],
      'Refrigeration Technicians': [
        "Double-door refrigerator is not cooling.",
        "Freezer compartment is building up excessive ice.",
        "Fridge compressor turns on and off repeatedly.",
        "Fridge water dispenser has stopped working.",
        "Bad smell and cooling failure in commercial freezer."
      ],
      'Painters': [
        "Repainting the living room wall (peeling paint).",
        "Full exterior house painting (two-story house).",
        "Water damage stains on ceiling need sealing and painting.",
        "Painting wooden window frames and doors.",
        "Applying weatherproofing coat on exterior walls."
      ],
      'Masons': [
        "Cracked concrete wall in the front yard.",
        "Laying ceramic floor tiles in the bathroom.",
        "Repairing damaged brick chimney.",
        "Plastering exterior concrete walls.",
        "Building a concrete foundation slab for water tank."
      ],
      'Appliance Repair Specialists': [
        "Washing machine does not spin during cycle.",
        "Microwave turns on but does not heat food.",
        "Gas cooker burner flame is extremely weak.",
        "Electric oven does not reach target temperature.",
        "Dishwasher is not draining water."
      ]
    };

    const statuses = ['intake', 'diagnosed', 'matched', 'estimated', 'scheduled', 'in_progress', 'completed'];

    for (let i = 1; i <= 100; i++) {
      const customer = getRandomElement(customers);
      const category = getRandomElement(CATEGORIES);
      const city = customer.city;
      const description = getRandomElement(issueDescriptions[category]);
      const status = getRandomElement(statuses);

      // Find a technician matching category to link (if status is matched or later)
      let matchedTech = null;
      if (['matched', 'estimated', 'scheduled', 'in_progress', 'completed'].includes(status)) {
        const matches = technicians.filter(t => t.category === category);
        if (matches.length > 0) {
          matchedTech = getRandomElement(matches);
        }
      }

      // Diagnose details
      const urgency = getRandomElement(['Low', 'Medium', 'High']);
      const confidence = parseFloat(getRandomRange(0.75, 0.99).toFixed(2));
      const diagnosis = `Probable cause identified: wear and tear in the standard component. Recommend on-site inspection and immediate servicing.`;

      const request = new RepairRequest({
        customer: customer._id,
        description,
        symptoms: ["unusual operation", "intermittent failure", "visible wear"],
        status,
        category,
        urgency,
        confidence,
        diagnosis,
        matchedTechnician: matchedTech ? matchedTech._id : undefined,
        city,
        createdAt: new Date(Date.now() - getRandomRange(1, 30) * 24 * 60 * 60 * 1000) // 1-30 days ago
      });

      await request.save();
      repairRequests.push(request);
    }

    // --- Guarantee tech1–tech10 each have at least 4 assigned requests for demo purposes ---
    const demoTechUsers = await User.find({ email: { $in: Array.from({length: 10}, (_, i) => `tech${i+1}@fixit.com`) } });
    for (const demoUser of demoTechUsers) {
      const demoTech = await Technician.findOne({ user: demoUser._id });
      if (!demoTech) continue;
      const count = await RepairRequest.countDocuments({ matchedTechnician: demoTech._id });
      const needed = Math.max(0, 4 - count);
      for (let k = 0; k < needed; k++) {
        const customer = getRandomElement(customers);
        const description = getRandomElement(issueDescriptions[demoTech.category] || issueDescriptions['Electricians']);
        const status = getRandomElement(['matched', 'estimated', 'scheduled']);
        const urgency = getRandomElement(['Low', 'Medium', 'High']);
        const req = new RepairRequest({
          customer: customer._id,
          description,
          symptoms: ["unusual operation", "intermittent failure"],
          status,
          category: demoTech.category,
          urgency,
          confidence: parseFloat(getRandomRange(0.80, 0.99).toFixed(2)),
          diagnosis: `Issue diagnosed. ${demoTech.category} specialist required.`,
          matchedTechnician: demoTech._id,
          city: customer.city || getRandomElement(CITIES),
          createdAt: new Date(Date.now() - getRandomRange(1, 10) * 24 * 60 * 60 * 1000)
        });
        await req.save();
        repairRequests.push(req);
      }
    }

    console.log(`${repairRequests.length} Repair Requests created (incl. guaranteed demo assignments).`);

    // Create 100 Estimates (Quotations)
    let estimatesCreated = 0;
    for (let i = 0; i < repairRequests.length; i++) {
      const request = repairRequests[i];
      if (['estimated', 'scheduled', 'in_progress', 'completed'].includes(request.status) && request.matchedTechnician) {
        const labor = Math.floor(getRandomRange(5000, 20000));
        const parts = Math.floor(getRandomRange(3000, 35000));
        const travel = Math.floor(getRandomRange(2000, 8000));
        const total = labor + parts + travel;

        const estimate = new Estimate({
          repairRequest: request._id,
          technician: request.matchedTechnician,
          labor,
          parts,
          travel,
          totalRange: `${total - 2000} FCFA - ${total + 3000} FCFA`,
          status: request.status === 'completed' ? 'accepted' : getRandomElement(['pending', 'accepted', 'declined']),
          createdAt: new Date(request.createdAt.getTime() + 2 * 60 * 60 * 1000) // 2 hours after request
        });
        await estimate.save();
        estimatesCreated++;
      }
    }
    // Fill up to 100 estimates if needed
    while (estimatesCreated < 100) {
      const request = getRandomElement(repairRequests);
      const tech = getRandomElement(technicians.filter(t => t.category === request.category)) || getRandomElement(technicians);

      const labor = Math.floor(getRandomRange(5000, 20000));
      const parts = Math.floor(getRandomRange(3000, 35000));
      const travel = Math.floor(getRandomRange(2000, 8000));
      const total = labor + parts + travel;

      const estimate = new Estimate({
        repairRequest: request._id,
        technician: tech._id,
        labor,
        parts,
        travel,
        totalRange: `${total - 2000} FCFA - ${total + 3000} FCFA`,
        status: getRandomElement(['pending', 'accepted', 'declined']),
        createdAt: new Date(request.createdAt.getTime() + 2 * 60 * 60 * 1000)
      });
      await estimate.save();
      estimatesCreated++;
    }
    console.log(`${estimatesCreated} Estimates (Quotations) created.`);

    // Create 50 Appointments
    let appointmentsCreated = 0;
    for (let i = 0; i < repairRequests.length && appointmentsCreated < 50; i++) {
      const request = repairRequests[i];
      if (['scheduled', 'in_progress', 'completed'].includes(request.status) && request.matchedTechnician) {
        const appointmentDate = new Date(request.createdAt.getTime() + getRandomRange(1, 5) * 24 * 60 * 60 * 1000);
        const appointment = new Appointment({
          repairRequest: request._id,
          technician: request.matchedTechnician,
          date: appointmentDate,
          duration: 90,
          location: `Rue de ${getRandomElement(LAST_NAMES)}, ${request.city}`,
          status: request.status === 'completed' ? 'confirmed' : getRandomElement(['pending', 'confirmed', 'cancelled']),
          createdAt: new Date(request.createdAt.getTime() + 4 * 60 * 60 * 1000) // 4 hours after request
        });
        await appointment.save();
        appointmentsCreated++;
      }
    }
    // Fill up to 50 appointments if needed
    while (appointmentsCreated < 50) {
      const request = getRandomElement(repairRequests);
      const tech = getRandomElement(technicians.filter(t => t.category === request.category)) || getRandomElement(technicians);
      const appointmentDate = new Date(request.createdAt.getTime() + getRandomRange(1, 5) * 24 * 60 * 60 * 1000);

      const appointment = new Appointment({
        repairRequest: request._id,
        technician: tech._id,
        date: appointmentDate,
        duration: 90,
        location: `Rue de ${getRandomElement(LAST_NAMES)}, ${request.city}`,
        status: getRandomElement(['pending', 'confirmed', 'cancelled']),
        createdAt: new Date(request.createdAt.getTime() + 4 * 60 * 60 * 1000)
      });
      await appointment.save();
      appointmentsCreated++;
    }
    console.log(`${appointmentsCreated} Appointments created.`);

    // Create 200 Reviews
    let reviewsCreated = 0;
    const reviewComments = [
      "Excellent work, highly professional!",
      "Polite, quick diagnosis and fixed the issue fast.",
      "The repair was okay but they arrived a bit late.",
      "Reasonable pricing and solid service.",
      "Very neat welding, the gate looks brand new.",
      "Professional install, solar is working perfectly.",
      "Knowledgeable and friendly, highly recommended.",
      "Slightly expensive but quality was top notch.",
      "Did a great job cleaning and repairing the AC.",
      "Found and fixed the leaks in no time. Satisfied!"
    ];

    while (reviewsCreated < 200) {
      const technician = getRandomElement(technicians);
      const customer = getRandomElement(customers);
      const rating = Math.floor(getRandomRange(3, 6)); // 3 to 5 stars

      const review = new Review({
        technician: technician._id,
        customer: customer._id,
        rating,
        comment: getRandomElement(reviewComments),
        createdAt: new Date(Date.now() - getRandomRange(1, 20) * 24 * 60 * 60 * 1000)
      });
      await review.save();
      reviewsCreated++;
    }
    console.log(`${reviewsCreated} Reviews created.`);

    // Create 20 Notifications
    for (let i = 0; i < 20; i++) {
      const user = getRandomElement(customers);
      const notification = new Notification({
        user: user._id,
        message: `Your repair request for AC repair has been successfully diagnosed. Check estimates.`,
        type: getRandomElement(['info', 'alert', 'reminder']),
        read: Math.random() > 0.5
      });
      await notification.save();
    }
    console.log('Notifications created.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
