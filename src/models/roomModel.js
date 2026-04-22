const { poolPromise } = require('../config/db');

class RoomModel {
    static async getAllRooms() {
        try {
            const pool = await poolPromise;
            // JOIN Room and RoomType to get complete info
            const result = await pool.request().query(`
                SELECT r.RoomNo, r.Occupancy, rt.RoomType, rt.RoomPrice, rt.RoomImg, rt.RoomDesc, h.HotelName
                FROM Room r
                INNER JOIN RoomType rt ON r.RoomType = rt.RoomType
                INNER JOIN Hotel h ON r.HotelCode = h.HotelCode
            `);
            return result.recordset;
        } catch (error) {
            throw error;
        }
    }

    static async searchRooms(arrivalDate, departureDate, guests, numRooms) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('ArrivalDate', arrivalDate)
                .input('DepartureDate', departureDate)
                .query(`
                    SELECT r.RoomType, rt.RoomPrice, rt.RoomImg, rt.RoomDesc, r.Occupancy, COUNT(r.RoomNo) as AvailableCount
                    FROM Room r
                    INNER JOIN RoomType rt ON r.RoomType = rt.RoomType
                    WHERE r.RoomNo NOT IN (
                        SELECT RoomNo FROM Booking 
                        WHERE (ArrivalDate < @DepartureDate AND DepartureDate > @ArrivalDate)
                    )
                    GROUP BY r.RoomType, rt.RoomPrice, rt.RoomImg, rt.RoomDesc, r.Occupancy
                `);
            
            const availableRooms = result.recordset;
            let recommendations = [];

            availableRooms.forEach(room => {
                const requestedRooms = numRooms || Math.ceil(guests / room.Occupancy);
                const totalCapacity = room.Occupancy * requestedRooms;
                
                if (requestedRooms <= room.AvailableCount && totalCapacity >= guests) {
                    recommendations.push({
                        ...room,
                        roomsNeeded: requestedRooms,
                        totalPrice: room.RoomPrice * requestedRooms
                    });
                }
            });

            recommendations.sort((a, b) => a.totalPrice - b.totalPrice);
            return recommendations;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RoomModel;
