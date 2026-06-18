USE hotel_management;
GO

INSERT INTO Guest (FirstName, LastName, Email, Password, PhoneNo, City, Country)
SELECT 'John', 'Doe', 'john.doe@example.com', 'password123', '0901111111', 'Hanoi', 'Vietnam'
WHERE NOT EXISTS (SELECT 1 FROM Guest WHERE Email = 'john.doe@example.com');

INSERT INTO Guest (FirstName, LastName, Email, Password, PhoneNo, City, Country)
SELECT 'Jane', 'Smith', 'jane.smith@example.com', 'password123', '0902222222', 'Ho Chi Minh City', 'Vietnam'
WHERE NOT EXISTS (SELECT 1 FROM Guest WHERE Email = 'jane.smith@example.com');

INSERT INTO Guest (FirstName, LastName, Email, Password, PhoneNo, City, Country)
SELECT 'Carlos', 'Nguyen', 'carlos.nguyen@example.com', 'password123', '0903333333', 'Da Nang', 'Vietnam'
WHERE NOT EXISTS (SELECT 1 FROM Guest WHERE Email = 'carlos.nguyen@example.com');

INSERT INTO Guest (FirstName, LastName, Email, Password, PhoneNo, City, Country)
SELECT 'Emily', 'Tran', 'emily.tran@example.com', 'password123', '0904444444', 'Hue', 'Vietnam'
WHERE NOT EXISTS (SELECT 1 FROM Guest WHERE Email = 'emily.tran@example.com');

INSERT INTO Guest (FirstName, LastName, Email, Password, PhoneNo, City, Country)
SELECT 'Akira', 'Yamamoto', 'akira.yamamoto@example.com', 'password123', '0905555555', 'Tokyo', 'Japan'
WHERE NOT EXISTS (SELECT 1 FROM Guest WHERE Email = 'akira.yamamoto@example.com');
GO

INSERT INTO Booking (HotelCode, GuestID, RoomNo, BookingDate, ArrivalDate, DepartureDate, NumAdults, NumChildren, BookingStatus)
SELECT 
    r.HotelCode, 
    g.GuestID, 
    r.RoomNo, 
    v.BookingDate, 
    v.ArrivalDate, 
    v.DepartureDate, 
    v.NumAdults, 
    v.NumChildren, 
    v.BookingStatus
FROM (
    VALUES 
    (1, 'john.doe@example.com', 1, '2026-01-01', '2026-05-01', '2026-05-04', 2, 0, 'CheckedOut'),
    (2, 'jane.smith@example.com', 2, '2026-01-02', '2026-06-10', '2026-06-13', 1, 0, 'CheckedOut'),
    (3, 'carlos.nguyen@example.com', 3, '2026-01-03', '2026-07-01', '2026-07-05', 2, 1, 'Confirmed'),
    (4, 'emily.tran@example.com', 4, '2026-01-04', '2026-07-15', '2026-07-18', 4, 0, 'Confirmed'),
    (5, 'akira.yamamoto@example.com', 5, '2026-01-05', '2026-06-20', '2026-06-22', 2, 0, 'CheckedIn'),
    (6, 'john.doe@example.com', 6, '2026-01-06', '2026-05-20', '2026-05-22', 2, 0, 'Cancelled')
) AS v(RowIdx, Email, RoomIdx, BookingDate, ArrivalDate, DepartureDate, NumAdults, NumChildren, BookingStatus)
JOIN Guest g ON g.Email = v.Email
JOIN (
    SELECT RoomNo, HotelCode, ROW_NUMBER() OVER (ORDER BY CAST(RoomNo AS INT)) AS RmIdx 
    FROM Room
) r ON r.RmIdx = v.RoomIdx
WHERE NOT EXISTS (SELECT 1 FROM Booking WHERE BookingDate = '2026-01-01');
GO

INSERT INTO Bill (GuestID, TotalAmount, RoomService, RestaurantCharges, BarCharges, MiscCharges, IfLateCheckout, PaymentDate, PaymentMode, PaymentStatus)
SELECT b.GuestID, 355.00, 30.00, 45.00, 20.00, 10.00, 0, GETDATE(), 'CreditCard', 'Paid'
FROM Booking b
WHERE b.BookingStatus = 'CheckedOut' AND b.InvoiceNo IS NULL;
GO

UPDATE b
SET b.InvoiceNo = bi.InvoiceNo
FROM Booking b
JOIN Bill bi ON bi.GuestID = b.GuestID
WHERE b.BookingStatus = 'CheckedOut' AND b.InvoiceNo IS NULL;
GO

INSERT INTO Review (GuestID, InvoiceNo, Rating, Comment)
SELECT b.GuestID, b.InvoiceNo, 5, 'Excellent stay and service.'
FROM Bill b
WHERE b.InvoiceNo IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM Review r WHERE r.InvoiceNo = b.InvoiceNo);
GO