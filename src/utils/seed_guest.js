require('dotenv').config();
const { poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedGuests() {
    try {
        const pool = await poolPromise;

        console.log("Seeding sample Guests...");
        const guestDefs = [
            { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', password: 'password123', phone: '0901111111' },
            { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', password: 'password123', phone: '0902222222' },
            { firstName: 'Carlos', lastName: 'Nguyen', email: 'carlos.nguyen@example.com', password: 'password123', phone: '0903333333' },
            { firstName: 'Emily', lastName: 'Tran', email: 'emily.tran@example.com', password: 'password123', phone: '0904444444' },
            { firstName: 'Akira', lastName: 'Yamamoto', email: 'akira.yamamoto@example.com', password: 'password123', phone: '0905555555' },
        ];

        const guestIds = {};

        for (const g of guestDefs) {
            const existing = await pool.request()
                .input('Email', g.email)
                .query('SELECT GuestID FROM Guest WHERE Email = @Email');

            if (existing.recordset.length > 0) {
                guestIds[g.email] = existing.recordset[0].GuestID;
                console.log(`⏭️  ${g.email} already exists, skipping creation`);
                continue;
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(g.password, salt);

            const result = await pool.request()
                .input('FirstName', g.firstName)
                .input('LastName', g.lastName)
                .input('Email', g.email)
                .input('Password', hashedPassword)
                .input('PhoneNo', g.phone)
                .query(`
                    INSERT INTO Guest (FirstName, LastName, Email, Password, PhoneNo)
                    OUTPUT INSERTED.GuestID
                    VALUES (@FirstName, @LastName, @Email, @Password, @PhoneNo)
                `);

            guestIds[g.email] = result.recordset[0].GuestID;
            console.log(`✅ Seeded Guest: ${g.email} / ${g.password}`);
        }

        // Need rooms + hotel to attach bookings to
        const hotelResult = await pool.request().query('SELECT TOP 1 HotelCode FROM Hotel');
        const hotelCode = hotelResult.recordset[0]?.HotelCode;
        const roomsResult = await pool.request().query('SELECT RoomNo FROM Room ORDER BY CAST(RoomNo AS INT)');
        const rooms = roomsResult.recordset;

        if (!hotelCode || rooms.length < 6) {
            console.log("⚠️ Hotel or Rooms not found/insufficient — run hotel.sql and room.sql first. Skipping bookings/bills/reviews.");
            process.exit(1);
        }

        console.log("Seeding sample Bookings...");
        const bookingDefs = [
            { guestEmail: 'john.doe@example.com', room: rooms[0].RoomNo, arrival: '2026-05-01', departure: '2026-05-04', adults: 2, children: 0, status: 'CheckedOut' },
            { guestEmail: 'jane.smith@example.com', room: rooms[1].RoomNo, arrival: '2026-06-10', departure: '2026-06-13', adults: 1, children: 0, status: 'CheckedOut' },
            { guestEmail: 'carlos.nguyen@example.com', room: rooms[2].RoomNo, arrival: '2026-07-01', departure: '2026-07-05', adults: 2, children: 1, status: 'Confirmed' },
            { guestEmail: 'emily.tran@example.com', room: rooms[3].RoomNo, arrival: '2026-07-15', departure: '2026-07-18', adults: 4, children: 0, status: 'Confirmed' },
            { guestEmail: 'akira.yamamoto@example.com', room: rooms[4].RoomNo, arrival: '2026-06-20', departure: '2026-06-22', adults: 2, children: 0, status: 'CheckedIn' },
            { guestEmail: 'john.doe@example.com', room: rooms[5].RoomNo, arrival: '2026-05-20', departure: '2026-05-22', adults: 2, children: 0, status: 'Cancelled' },
        ];

        const bookingIds = [];

        for (const b of bookingDefs) {
            const guestId = guestIds[b.guestEmail];
            if (!guestId) continue;

            const existing = await pool.request()
                .input('GuestID', guestId)
                .input('RoomNo', b.room)
                .input('ArrivalDate', b.arrival)
                .query(`
                    SELECT BookingID, InvoiceNo FROM Booking
                    WHERE GuestID = @GuestID AND RoomNo = @RoomNo AND ArrivalDate = @ArrivalDate
                `);

            if (existing.recordset.length > 0) {
                bookingIds.push({ ...existing.recordset[0], status: b.status, guestId });
                console.log(`⏭️  Booking for ${b.guestEmail} on ${b.arrival} already exists, skipping`);
                continue;
            }

            const result = await pool.request()
                .input('HotelCode', hotelCode)
                .input('GuestID', guestId)
                .input('RoomNo', b.room)
                .input('BookingDate', b.arrival)
                .input('ArrivalDate', b.arrival)
                .input('DepartureDate', b.departure)
                .input('NumAdults', b.adults)
                .input('NumChildren', b.children)
                .input('BookingStatus', b.status)
                .query(`
                    INSERT INTO Booking (HotelCode, GuestID, RoomNo, BookingDate, ArrivalDate, DepartureDate, NumAdults, NumChildren, BookingStatus)
                    OUTPUT INSERTED.BookingID, INSERTED.InvoiceNo
                    VALUES (@HotelCode, @GuestID, @RoomNo, @BookingDate, @ArrivalDate, @DepartureDate, @NumAdults, @NumChildren, @BookingStatus)
                `);

            bookingIds.push({ ...result.recordset[0], status: b.status, guestId });
            console.log(`✅ Seeded Booking: ${b.guestEmail} → Room ${b.room} (${b.status})`);
        }

        console.log("Seeding sample Bills...");
        const checkedOutBookings = bookingIds.filter(b => b.status === 'CheckedOut' && !b.InvoiceNo);
        const billInvoices = [];

        for (const booking of checkedOutBookings) {
            const billResult = await pool.request()
                .input('GuestID', booking.guestId)
                .query(`
                    INSERT INTO Bill (GuestID, TotalAmount, RoomService, RestaurantCharges, BarCharges, MiscCharges, IfLateCheckout, PaymentDate, PaymentMode, PaymentStatus)
                    OUTPUT INSERTED.InvoiceNo
                    VALUES (@GuestID, 355.00, 30.00, 45.00, 20.00, 10.00, 0, GETDATE(), 'CreditCard', 'Paid')
                `);

            const invoiceNo = billResult.recordset[0].InvoiceNo;

            await pool.request()
                .input('BookingID', booking.BookingID)
                .input('InvoiceNo', invoiceNo)
                .query('UPDATE Booking SET InvoiceNo = @InvoiceNo WHERE BookingID = @BookingID');

            billInvoices.push({ invoiceNo, guestId: booking.guestId });
            console.log(`✅ Seeded Bill: InvoiceNo ${invoiceNo} for BookingID ${booking.BookingID}`);
        }

        console.log("Seeding sample Reviews...");
        const reviewComments = [
            'Excellent stay and service.',
            'Very comfortable room, would come back again.',
        ];

        for (let i = 0; i < billInvoices.length; i++) {
            const { invoiceNo, guestId } = billInvoices[i];

            const existing = await pool.request()
                .input('InvoiceNo', invoiceNo)
                .query('SELECT ReviewID FROM Review WHERE InvoiceNo = @InvoiceNo');

            if (existing.recordset.length > 0) {
                console.log(`⏭️  Review for InvoiceNo ${invoiceNo} already exists, skipping`);
                continue;
            }

            await pool.request()
                .input('GuestID', guestId)
                .input('InvoiceNo', invoiceNo)
                .input('Rating', 5)
                .input('Comment', reviewComments[i % reviewComments.length])
                .query(`
                    INSERT INTO Review (GuestID, InvoiceNo, Rating, Comment)
                    VALUES (@GuestID, @InvoiceNo, @Rating, @Comment)
                `);

            console.log(`✅ Seeded Review for InvoiceNo ${invoiceNo}`);
        }

        console.log("✅ Guest + Booking + Bill + Review seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Guest seeding failed: ", error);
        process.exit(1);
    }
}

seedGuests();