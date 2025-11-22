const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./route-manifests/auth');
const registerRoutes = require('../modules/register-migrated/routes/register');
const trainRoutes = require('./route-manifests/trains');
const orderRoutes = require('./route-manifests/orders');
const passengerRoutes = require('./route-manifests/passengers');
const stationRoutes = require('./route-manifests/stations');
const ticketRoutes = require('./route-manifests/tickets');
const errorHandler = require('./request-interceptors/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/terms', registerRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/passengers', passengerRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/tickets', ticketRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
