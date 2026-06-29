require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { msg: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';
console.log(`Connecting to MongoDB at ${mongoUri}`);
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the FIXIT AI AGENT API Gateway!' });
});

// Register Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/technicians', require('./routes/technicians'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/estimates', require('./routes/estimates'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
