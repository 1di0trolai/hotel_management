USE hotel_management;
GO

DECLARE @HotelCode INT;
SELECT TOP 1 @HotelCode = HotelCode FROM Hotel;

IF @HotelCode IS NOT NULL
BEGIN
    INSERT INTO Employee (HotelCode, RoleID, FirstName, LastName, DOB, Gender, PhoneNo, Email, Password, Salary)
    SELECT 
        @HotelCode, 
        r.RoleID, 
        v.FirstName, 
        v.LastName, 
        v.DOB, 
        v.Gender, 
        v.PhoneNo, 
        v.Email, 
        v.Password, 
        v.Salary
    FROM (
        VALUES 
        ('System', 'Admin', '1990-01-01', 'Other', '0900000001', 'admin@grandpalace.com', 'admin123', 5000.00, 'Admin'),
        ('Hoang', 'Le', '1985-03-12', 'Male', '0900000002', 'manager@grandpalace.com', 'manager123', 3500.00, 'Manager'),
        ('Mai', 'Pham', '1995-07-22', 'Female', '0900000003', 'reception@grandpalace.com', 'reception123', 1800.00, 'Receptionist'),
        ('Linh', 'Vo', '1992-11-05', 'Female', '0900000004', 'housekeeping@grandpalace.com', 'housekeeping123', 1500.00, 'Housekeeping'),
        ('Duc', 'Tran', '1988-09-18', 'Male', '0900000005', 'accountant@grandpalace.com', 'accountant123', 2200.00, 'Accountant'),
        ('Tuan', 'Nguyen', '1991-04-30', 'Male', '0900000006', 'maintenance@grandpalace.com', 'maintenance123', 1600.00, 'Maintenance'),
        ('Anh', 'Dang', '1993-02-14', 'Female', '0900000007', 'concierge@grandpalace.com', 'concierge123', 1700.00, 'Concierge'),
        ('Khanh', 'Bui', '1996-08-09', 'Male', '0900000008', 'bartender@grandpalace.com', 'bartender123', 1400.00, 'Bartender'),
        ('Phuong', 'Hoang', '1994-06-25', 'Female', '0900000009', 'cashier@grandpalace.com', 'cashier123', 1400.00, 'Cashier')
    ) AS v(FirstName, LastName, DOB, Gender, PhoneNo, Email, Password, Salary, RoleTitle)
    JOIN Role r ON r.RoleTitle = v.RoleTitle
    WHERE NOT EXISTS (SELECT 1 FROM Employee WHERE Email = v.Email);
END
GO