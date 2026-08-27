const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'officer'], default: 'farmer' },
  hubLocation: { type: String, default: '' }, // For officers assigned to a specific hub
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);