const { poolPromise } = require('../config/db');

class BookingModel {
    static async getAllBookings() {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT b.BookingID, g.FirstName + ' ' + g.LastName AS GuestName, 
                       b.RoomNo, r.RoomType, b.ArrivalDate, b.DepartureDate
                FROM Booking b
                INNER JOIN Guest g ON b.GuestID = g.GuestID
                INNER JOIN Room r ON b.RoomNo = r.RoomNo
                ORDER BY b.BookingID DESC
            `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async createBooking(guestID, roomType, arrivalDate, departureDate) {
        try {
            const pool = await poolPromise;
            
            // Find a room of this type that is NOT booked during these dates
            const roomQuery = await pool.request()
                .input('RoomType', roomType)
                .input('ArrivalDate', arrivalDate)
                .input('DepartureDate', departureDate)
                .query(`
                    SELECT TOP 1 RoomNo, HotelCode 
                    FROM Room 
                    WHERE RoomType = @RoomType
                    AND RoomNo NOT IN (
                        SELECT RoomNo FROM Booking 
                        WHERE ArrivalDate < @DepartureDate AND DepartureDate > @ArrivalDate
                    )
                `);

            if (roomQuery.recordset.length === 0) {
                throw new Error('No rooms available for this type during the selected dates.');
            }

            const roomNo = roomQuery.recordset[0].RoomNo;
            const hotelCode = roomQuery.recordset[0].HotelCode;

            // Insert Booking
            const result = await pool.request()
                .input('HotelCode', hotelCode)
                .input('GuestID', guestID)
                .input('RoomNo', roomNo)
                .input('BookingDate', new Date())
                .input('ArrivalDate', arrivalDate)
                .input('DepartureDate', departureDate)
                .query(`
                    INSERT INTO Booking (HotelCode, GuestID, RoomNo, BookingDate, ArrivalDate, DepartureDate)
                    OUTPUT INSERTED.BookingID
                    VALUES (@HotelCode, @GuestID, @RoomNo, @BookingDate, @ArrivalDate, @DepartureDate)
                `);

            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BookingModel;
