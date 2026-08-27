const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

// BOOK A SLOT (Farmer)
router.post('/book', async (req, res) => {
  try {
    const { farmerId, farmerName, farmerPhone, cropType, weightQuintals, hubLocation, bookingSource } = req.body;

    const tokenNumber = `#KRN-${Math.floor(1000 + Math.random() * 9000)}`;

    const newSlot = new Slot({
      farmerId,
      farmerName,
      farmerPhone,
      cropType,
      weightQuintals,
      hubLocation,
      tokenNumber,
      bookingSource: bookingSource || 'Web'
    });

    await newSlot.save();
    res.status(201).json({ message: 'Slot booked successfully!', slot: newSlot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SLOTS FOR A SPECIFIC FARMER
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const slots = await Slot.find({ farmerId: req.params.farmerId }).sort({ bookingDate: -1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL SLOTS (Officer View)
router.get('/all', async (req, res) => {
  try {
    const slots = await Slot.find().sort({ bookingDate: -1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE SLOT STATUS & GRADE (Officer Action)
router.patch('/update-status/:id', async (req, res) => {
  try {
    const { status, qualityGrade } = req.body;
    const updatedSlot = await Slot.findByIdAndUpdate(
      req.params.id,
      { status, qualityGrade },
      { new: true }
    );
    res.json(updatedSlot);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// CHECK TOKEN STATUS VIA SMS / QUERY (Public Endpoint)
router.get('/status/:tokenNumber', async (req, res) => {
  try {
    const token = req.params.tokenNumber.toUpperCase();
    const slot = await Slot.findOne({ tokenNumber: token });

    if (!slot) {
      return res.status(404).json({ message: `Token ${token} not found.` });
    }

    res.json({
      tokenNumber: slot.tokenNumber,
      farmerName: slot.farmerName,
      cropType: slot.cropType,
      status: slot.status,
      qualityGrade: slot.qualityGrade,
      hubLocation: slot.hubLocation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;