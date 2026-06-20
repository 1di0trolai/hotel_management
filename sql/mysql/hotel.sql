USE hotel_management;
GO

-- ========================================
-- HOTEL
-- ========================================
INSERT INTO Hotel (HotelName, Address, Postcode, City, Country, NumRooms, PhoneNo)
SELECT 'Grand Palace Hotel', '123 Main St', '10000', 'Hanoi', 'Vietnam', 20, '024-3822-0000'
WHERE NOT EXISTS (SELECT 1 FROM Hotel WHERE HotelName = 'Grand Palace Hotel');
GO

-- ========================================
-- ROOM TYPES
-- ========================================
INSERT INTO RoomType (RoomType, RoomPrice, RoomImg, RoomDesc)
SELECT 'Standard Twin', 60.00, 'standard.jpg', 'Standard room with 2 single beds for up to 2 guests'
WHERE NOT EXISTS (SELECT 1 FROM RoomType WHERE RoomType = 'Standard Twin');

INSERT INTO RoomType (RoomType, RoomPrice, RoomImg, RoomDesc)
SELECT 'Standard Double', 75.00, 'standard.jpg', 'Standard room with 2 double beds for up to 4 guests'
WHERE NOT EXISTS (SELECT 1 FROM RoomType WHERE RoomType = 'Standard Double');

INSERT INTO RoomType (RoomType, RoomPrice, RoomImg, RoomDesc)
SELECT 'Deluxe', 120.00, 'deluxe.jpg', 'Premium deluxe room with city view for up to 4 guests'
WHERE NOT EXISTS (SELECT 1 FROM RoomType WHERE RoomType = 'Deluxe');

INSERT INTO RoomType (RoomType, RoomPrice, RoomImg, RoomDesc)
SELECT 'Suite', 350.00, 'suite.jpg', 'Large luxury suite for families or groups up to 16 guests'
WHERE NOT EXISTS (SELECT 1 FROM RoomType WHERE RoomType = 'Suite');
GO

USE hotel_management;
GO

-- ========================================
-- ROLES
-- ========================================
INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Admin', 'System administrator (IT)'
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE RoleTitle = 'Admin');

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Manager', 'Hotel operations manager'
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE RoleTitle = 'Manager');

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Receptionist', 'Handles check-in, check-out, and booking'
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE RoleTitle = 'Receptionist');

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Housekeeper', 'Updates room cleaning status'
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE RoleTitle = 'Housekeeper');

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Maintenance', 'Handles repairs and room maintenance requests'
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE RoleTitle = 'Maintenance');

INSERT INTO Role (RoleTitle, RoleDesc)
SELECT 'Accountant', 'Manages billing, invoices and financial records'
WHERE NOT EXISTS (SELECT 1 FROM Role WHERE RoleTitle = 'Accountant');
GO

-- ========================================
-- PERMISSIONS
-- ========================================
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

-- ========================================
-- ROLE-PERMISSION MAPPING
-- ========================================

-- ADMIN: full access
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r, Permission p
WHERE r.RoleTitle = 'Admin'
AND NOT EXISTS (
SELECT 1
FROM RolePermission rp
WHERE rp.RoleID = r.RoleID
AND rp.PermissionID = p.PermissionID
);

-- MANAGER
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Manager'
AND p.PermissionKey IN (
'view_bookings', 'manage_bookings',
'view_rooms', 'manage_rooms',
'view_bills', 'manage_bills',
'view_guests', 'manage_employees',
'view_statistics'
)
AND NOT EXISTS (
SELECT 1
FROM RolePermission rp
WHERE rp.RoleID = r.RoleID
AND rp.PermissionID = p.PermissionID
);

-- RECEPTIONIST
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Receptionist'
AND p.PermissionKey IN (
'view_bookings', 'manage_bookings',
'view_rooms', 'view_guests',
'view_bills', 'manage_bills'
)
AND NOT EXISTS (
SELECT 1
FROM RolePermission rp
WHERE rp.RoleID = r.RoleID
AND rp.PermissionID = p.PermissionID
);

-- HOUSEKEEPER
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Housekeeper'
AND p.PermissionKey IN ('view_rooms', 'manage_rooms')
AND NOT EXISTS (
SELECT 1
FROM RolePermission rp
WHERE rp.RoleID = r.RoleID
AND rp.PermissionID = p.PermissionID
);

-- MAINTENANCE
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Maintenance'
AND p.PermissionKey IN ('view_rooms', 'manage_rooms')
AND NOT EXISTS (
SELECT 1
FROM RolePermission rp
WHERE rp.RoleID = r.RoleID
AND rp.PermissionID = p.PermissionID
);

-- ACCOUNTANT
INSERT INTO RolePermission (RoleID, PermissionID)
SELECT r.RoleID, p.PermissionID
FROM Role r CROSS JOIN Permission p
WHERE r.RoleTitle = 'Accountant'
AND p.PermissionKey IN (
'view_bills',
'manage_bills',
'view_bookings',
'view_statistics'
)
AND NOT EXISTS (
SELECT 1
FROM RolePermission rp
WHERE rp.RoleID = r.RoleID
AND rp.PermissionID = p.PermissionID
);
GO
