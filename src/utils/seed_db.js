require('dotenv').config();
const { poolPromise } = require('../config/db');

async function seedData() {
    try {
        const pool = await poolPromise;

        console.log("Seeding Roles...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM Role)
            BEGIN
                INSERT INTO Role (RoleTitle, RoleDesc) VALUES 
                ('Manager', 'Hotel Manager'),
                ('Receptionist', 'Front Desk Staff'),
                ('Admin', 'System Administrator'),
                ('Housekeeping', 'Cleans and maintains room status'),
                ('Maintenance', 'Handles repairs and room maintenance requests'),
                ('Accountant', 'Manages billing, invoices and financial records'),
                ('Concierge', 'Assists guests with bookings, requests and local information'),
                ('Bartender', 'Manages bar service and bar charges on guest bills')
            END
        `);

        console.log("Seeding Hotel...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM Hotel)
            BEGIN
                INSERT INTO Hotel (HotelName, Address, Postcode, City, Country, NumRooms, PhoneNo, StarRating) 
                VALUES ('Grand Palace Hotel', '123 Main St', '10000', 'Hanoi', 'Vietnam', 100, '0123456789', 5)
            END
        `);

        console.log("Seeding Room Types...");
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM RoomType)
            BEGIN
                INSERT INTO RoomType (RoomType, RoomPrice, DefaultRoomPrice, RoomImg, RoomDesc) 
                VALUES 
                ('Standard Twin', 60.00, 60.00, 'standard.jpg', 'Standard Room with 2 Single Beds (Max 2 pax)'),
                ('Standard Double', 75.00, 75.00, 'standard.jpg', 'Standard Room with 2 Double Beds (Max 4 pax)'),
                ('Deluxe', 120.00, 120.00, 'deluxe.jpg', 'Premium Deluxe Room (Max 4 pax)'),
                ('Suite', 350.00, 350.00, 'suite.jpg', 'Luxury Large Suite (Up to 16 pax)')
            END
        `);

        console.log("✅ Database Seeding Completed Successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Database Seeding Failed: ", error);
        process.exit(1);
    }
}

seedData();