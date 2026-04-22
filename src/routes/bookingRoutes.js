const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// GET /api/bookings (Staff only ideally)
router.get('/', bookingController.getAllBookings);

// POST /api/bookings
router.post('/', bookingController.createBooking);

module.exports = router;
