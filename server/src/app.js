const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const studyGroupRoutes = require('./routes/studyGroupRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai-assistant', aiRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

module.exports = app;
