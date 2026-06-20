const RoomModel = require('../models/roomModel');

exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await RoomModel.getAllRooms();
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error in getAllRooms: ", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.searchRooms = async (req, res) => {
    try {
        const { arrivalDate, departureDate, guests, numRooms } = req.body;
        if (!arrivalDate || !departureDate || !guests) {
            return res.status(400).json({ message: 'Missing parameters' });
        }
        const recommendations = await RoomModel.searchRooms(
            arrivalDate, 
            departureDate, 
            parseInt(guests), 
            numRooms ? parseInt(numRooms) : null
        );
        res.status(200).json(recommendations);
    } catch (error) {
        console.error("Error searching rooms:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllRoomsWithStatus = async (req, res) => {
    try {
        const rooms = await RoomModel.getAllRoomsWithStatus();
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error in getAllRoomsWithStatus:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateRoomStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });

        // Role-specific status restrictions. Housekeeper and Maintenance can only
        // toggle the one status pair relevant to their job; other manage_rooms
        // roles (Receptionist/Manager/Admin) are unrestricted.
        const allowedStatusesByRole = {
            Housekeeper: ['Available', 'Cleaning'],
            Maintenance: ['Available', 'Maintenance']
        };
        const allowed = allowedStatusesByRole[req.employeeRole];

        if (allowed && !allowed.includes(status)) {
            return res.status(403).json({
                message: `${req.employeeRole} cannot set room status to '${status}'.`
            });
        }

        const success = await RoomModel.updateRoomStatus(req.params.roomNo, status);
        if (success) {
            res.status(200).json({ message: 'Room status updated successfully' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        console.error("Error updating room status:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
