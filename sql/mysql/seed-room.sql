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

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'view_bookings', 'See booking list'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'view_bookings');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_bookings', 'Create/check-in/check-out/cancel bookings'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_bookings');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'view_rooms', 'See room list/status'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'view_rooms');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_rooms', 'Change room status'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_rooms');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'view_bills', 'See bills/invoices'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'view_bills');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_bills', 'Generate bills, update payment status'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_bills');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_bar_charges', 'Add bar charges to a bill'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_bar_charges');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_restaurant_charges', 'Add restaurant charges to a bill'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_restaurant_charges');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'view_guests', 'See guest list/info'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'view_guests');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_employees', 'Add/edit/remove staff accounts'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_employees');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'manage_roles', 'Edit role permissions'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'manage_roles');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'view_statistics', 'See dashboard stats/analytics'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'view_statistics');

INSERT INTO Permission (PermissionKey, PermissionDesc)
SELECT 'system_settings', 'Hotel-wide settings'
WHERE NOT EXISTS (SELECT 1 FROM Permission WHERE PermissionKey = 'system_settings');
GO

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r, Permission p
WHERE r.RoleTitle = 'Admin'
  AND NOT EXISTS (
      SELECT 1 FROM RolePermission rp 
      WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID
  );

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Manager' 
  AND p.PermissionKey IN ('view_bookings', 'manage_bookings', 'view_rooms', 'manage_rooms', 'view_bills', 'manage_bills', 'view_guests', 'view_statistics')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Receptionist' 
  AND p.PermissionKey IN ('view_bookings', 'manage_bookings', 'view_rooms', 'view_guests')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Housekeeping' 
  AND p.PermissionKey IN ('view_rooms', 'manage_rooms')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Maintenance' 
  AND p.PermissionKey IN ('view_rooms', 'manage_rooms')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Accountant' 
  AND p.PermissionKey IN ('view_bills', 'manage_bills', 'view_bookings')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Concierge' 
  AND p.PermissionKey IN ('view_bookings', 'view_guests')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Bartender' 
  AND p.PermissionKey IN ('view_bills', 'manage_bar_charges')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);

INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Cashier' 
  AND p.PermissionKey IN ('view_bills', 'manage_restaurant_charges')
  AND NOT EXISTS (SELECT 1 FROM RolePermission rp WHERE rp.RoleID = r.RoleID AND rp.PermissionID = p.PermissionID);
GO