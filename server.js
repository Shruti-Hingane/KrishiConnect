const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/krishiconnect')
  .then(() => console.log('✅ Connected to MongoDB Database'))
  .catch(err => console.error('❌ Database Connection Error:', err));

const PORT = process.env.PORT || 5000;
res.sendFile(path.join(__dirname, 'frontend/index.html'));
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
