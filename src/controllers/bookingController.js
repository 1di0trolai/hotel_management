const BookingModel = require('../models/bookingModel');
const GuestModel = require('../models/guestModel');

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await BookingModel.getAllBookings();
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createBookingOrder = async (req, res) => {
    try {
        const { guestId, comboParts, arrivalDate, departureDate, numAdults, numChildren, specialReq } = req.body;
        
        if (!guestId || !comboParts || !arrivalDate || !departureDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const invoiceNo = await BookingModel.createBookingOrder(guestId, comboParts, arrivalDate, departureDate, numAdults, numChildren, specialReq);
        res.status(201).json({ message: 'Booking order created successfully', invoiceNo: invoiceNo });
    } catch (error) {
        console.error("Error creating booking order:", error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

exports.createBooking = async (req, res) => {
    try {
        const { guestId, roomType, arrivalDate, departureDate } = req.body;
        
        if (!guestId || !roomType || !arrivalDate || !departureDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newBooking = await BookingModel.createBooking(guestId, roomType, arrivalDate, departureDate);
        res.status(201).json({ message: 'Booking created successfully', bookingId: newBooking.BookingID });
    } catch (error) {
        console.error("Error creating booking:", error);
        if (error.message === 'No rooms available for this type.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createWalkInBooking = async (req, res) => {
    try {
        const {
            firstName, lastName, phoneNo, email, passportNo,
            roomNo, hotelCode, arrivalDate, departureDate,
            adults, children
        } = req.body;

        const missing = [];

        if (!firstName?.trim()) missing.push('First Name');
        if (!lastName?.trim()) missing.push('Last Name');
        if (!phoneNo?.trim()) missing.push('Phone Number');
        if (!roomNo) missing.push('Room Number');
        if (hotelCode === undefined || hotelCode === null || hotelCode === '') missing.push('Hotel');
        if (!arrivalDate) missing.push('Check-in Date');
        if (!departureDate) missing.push('Check-out Date');

        if (missing.length > 0) {
            return res.status(400).json({
                message: `Missing required field(s): ${missing.join(', ')}`,
                missingFields: missing
            });
        }

        const arrival = new Date(arrivalDate);
        const departure = new Date(departureDate);
        if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
            return res.status(400).json({ message: 'Check-in/Check-out date is invalid.' });
        }
        if (departure <= arrival) {
            return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
        }

        const numAdults = adults === undefined || adults === '' ? 1 : parseInt(adults, 10);
        const numChildren = children === undefined || children === '' ? 0 : parseInt(children, 10);

        if (!Number.isInteger(numAdults) || numAdults < 1) {
            return res.status(400).json({ message: 'Adults must be at least 1.' });
        }
        if (!Number.isInteger(numChildren) || numChildren < 0) {
            return res.status(400).json({ message: 'Children cannot be negative.' });
        }

        const guestInfo = await GuestModel.createWalkInGuest({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phoneNo: phoneNo.trim(),
            email: email?.trim() || null,
            passportNo: passportNo?.trim() || null
        });

        const booking =
            await BookingModel.createWalkInBooking({
                guestId: guestInfo.guest.GuestID,
                hotelCode,
                roomNo,
                arrivalDate,
                departureDate,
                adults: numAdults,
                children: numChildren,
                checkInNow: req.body.checkInNow
            });

        res.status(201).json({
            success: true,
            guestId: guestInfo.guest.GuestID,
            invoiceNo: booking.invoiceNo,
            totalAmount: booking.totalAmount,
            generatedPassword:
                guestInfo.existing
                    ? null
                    : guestInfo.tempPassword
        });

    } catch (error) {
        console.error(error);

        if (error.message === 'Room is no longer available.' || error.message === 'Room not found.') {
            return res.status(409).json({ message: error.message });
        }
        if (error.message === 'Departure date must be after arrival date.') {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        const success = await BookingModel.updateBookingStatus(bookingId, status);
        if (success) {
            res.status(200).json({ message: 'Status updated successfully' });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        console.error("Error updating booking status:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getBookingStatistics = async (req, res) => {
    try {
        const stats = await BookingModel.getBookingStatistics();
        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching booking statistics:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getBookingsByGuest = async (req, res) => {
    try {
        const guestId = req.params.guestId;
        const bookings = await BookingModel.getBookingsByGuest(guestId);
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching guest bookings:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const guestId = req.body.guestId; // Should be in body or from auth token
        if (!guestId) {
            return res.status(400).json({ message: 'Guest ID is required' });
        }
        const success = await BookingModel.cancelBooking(bookingId, guestId);
        if (success) {
            res.status(200).json({ message: 'Booking cancelled successfully' });
        } else {
            res.status(400).json({ message: 'Unable to cancel booking. It may have already been cancelled or you do not have permission.' });
        }
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
