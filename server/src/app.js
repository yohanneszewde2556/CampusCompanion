const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/lost-found', lostFoundRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

module.exports = app;
