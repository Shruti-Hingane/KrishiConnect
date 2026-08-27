const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  cropType: { type: String, required: true },
  weightQuintals: { type: Number, required: true },
  hubLocation: { type: String, required: true },
  tokenNumber: { type: String, required: true, unique: true },
  status: { type: String, enum: ['Booked', 'In Inspection', 'Verified', 'Completed', 'Cancelled'], default: 'Booked' },
  qualityGrade: { type: String, default: 'Pending' },
  bookingSource: { type: String, enum: ['Web', 'SMS'], default: 'Web' },
  bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slot', slotSchema);