const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// GET /api/bills
router.get('/', billController.getAllBills);

// GET /api/bills/guest/:guestId
router.get('/guest/:guestId', billController.getBillsByGuest);

// PUT /api/bills/pay/:invoiceNo
router.put('/pay/:invoiceNo', billController.payInvoice);

// GET /api/bills/:invoiceNo
router.get('/:invoiceNo', billController.getBillDetails);

module.exports = router;
