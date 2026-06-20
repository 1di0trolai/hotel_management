const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// GET /api/rooms
router.get('/', roomController.getAllRooms);

// POST /api/rooms/search
router.post('/search', roomController.searchRooms);

// GET /api/rooms/status
router.get('/status', roomController.getAllRoomsWithStatus);

// PUT /api/rooms/:roomNo/status
router.put('/:roomNo/status', roomController.updateRoomStatus);

module.exports = router;
