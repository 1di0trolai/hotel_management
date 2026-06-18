USE hotel_management;
GO

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Manager', 'Hotel Manager'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Manager'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Receptionist', 'Front Desk Staff'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Receptionist'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Admin', 'System Administrator'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Admin'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Housekeeping', 'Cleans and maintains room status'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Housekeeping'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Maintenance', 'Handles repairs and maintenance'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Maintenance'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Accountant', 'Manages billing and invoices'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Accountant'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Concierge', 'Guest assistance services'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Concierge'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Bartender', 'Manages bar services'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Bartender'
);

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Cashier', 'Processes guest payments'
WHERE NOT EXISTS (
    SELECT 1 FROM Role WHERE RoleTitle = 'Cashier'
);
GO

INSERT INTO Hotel (
    HotelName,
    Address,
    Postcode,
    City,
    Country,
    NumRooms,
    PhoneNo,
    StarRating
)
SELECT
    'Grand Palace Hotel',
    '123 Main St',
    '10000',
    'Hanoi',
    'Vietnam',
    100,
    '0123456789',
    5
WHERE NOT EXISTS (
    SELECT 1
    FROM Hotel
    WHERE HotelName = 'Grand Palace Hotel'
);
GO

INSERT INTO RoomType (
    RoomType,
    RoomPrice,
    DefaultRoomPrice,
    RoomImg,
    RoomDesc
)
SELECT
    'Standard Twin',
    60,
    60,
    'standard.jpg',
    'Standard Room with 2 Single Beds (Max 2 pax)'
WHERE NOT EXISTS (
    SELECT 1
    FROM RoomType
    WHERE RoomType = 'Standard Twin'
);

INSERT INTO RoomType (
    RoomType,
    RoomPrice,
    DefaultRoomPrice,
    RoomImg,
    RoomDesc
)
SELECT
    'Standard Double',
    75,
    75,
    'standard.jpg',
    'Standard Room with 2 Double Beds (Max 4 pax)'
WHERE NOT EXISTS (
    SELECT 1
    FROM RoomType
    WHERE RoomType = 'Standard Double'
);

INSERT INTO RoomType (
    RoomType,
    RoomPrice,
    DefaultRoomPrice,
    RoomImg,
    RoomDesc
)
SELECT
    'Deluxe',
    120,
    120,
    'deluxe.jpg',
    'Premium Deluxe Room (Max 4 pax)'
WHERE NOT EXISTS (
    SELECT 1
    FROM RoomType
    WHERE RoomType = 'Deluxe'
);

INSERT INTO RoomType (
    RoomType,
    RoomPrice,
    DefaultRoomPrice,
    RoomImg,
    RoomDesc
)
SELECT
    'Suite',
    350,
    350,
    'suite.jpg',
    'Luxury Large Suite (Up to 16 pax)'
WHERE NOT EXISTS (
    SELECT 1
    FROM RoomType
    WHERE RoomType = 'Suite'
);
GO