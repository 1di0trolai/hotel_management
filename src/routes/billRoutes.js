const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// GET /api/bills/guest/:guestId
router.get('/guest/:guestId', billController.getBillsByGuest);

// PUT /api/bills/pay/:invoiceNo
router.put('/pay/:invoiceNo', billController.payInvoice);

module.exports = router;
