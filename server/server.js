const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const pyqRoutes = require('./routes/pyqRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');

// Connect to Database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins (supports Vercel, localhost, and mobile apps)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Root endpoint for deployment verification
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'StudyVault API Server',
    message: 'Backend is active and ready!',
    healthCheck: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'StudyVault API Server',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Handle 404 for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 10000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[StudyVault Server Running] in ${process.env.NODE_ENV || 'development'} mode on primary port ${PORT}`);
});

// Render load-balancer compatibility: ensure port 10000 is always listening
if (PORT !== 10000) {
  try {
    app.listen(10000, '0.0.0.0', () => {
      console.log(`[StudyVault Server] Also listening on port 10000 for Render routing`);
    }).on('error', (err) => {
      console.log(`[Port 10000]: ${err.message}`);
    });
  } catch (e) {}
}

// Ensure port 5000 is also listening if PORT is different
if (PORT !== 5000) {
  try {
    app.listen(5000, '0.0.0.0', () => {
      console.log(`[StudyVault Server] Also listening on port 5000`);
    }).on('error', (err) => {
      console.log(`[Port 5000]: ${err.message}`);
    });
  } catch (e) {}
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});

module.exports = app;
