const { poolPromise } = require('../config/db');

const bcrypt = require('bcryptjs');

class EmployeeModel {
    static async login(email, password) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Email', email)
                // Truy xuất thông tin cơ bản của nhân viên và chức vụ (Role) để xác thực đăng nhập vào hệ thống quản trị.
                .query(`
                    SELECT e.EmployeeID, e.FirstName, e.LastName, e.Email, e.Password, e.RoleID, r.RoleTitle 
                    FROM Employee e
                    INNER JOIN Role r ON e.RoleID = r.RoleID
                    WHERE e.Email = @Email
                `);

            if (result.recordset.length === 0) {
                return null;
            }

            const employee = result.recordset[0];
            const isValid = await bcrypt.compare(password, employee.Password);
            if (!isValid) return null;

            delete employee.Password;

            // Fetch RBAC Permissions
            const permResult = await pool.request()
                .input('RoleID', employee.RoleID)
                // Lấy danh sách các quyền hạn cụ thể (Permissions) của nhân viên đó để hệ thống tự động ẩn/hiện các chức năng tương ứng (Phân quyền RBAC).
                .query(`
                    SELECT p.PermissionKey
                    FROM RolePermission rp
                    JOIN Permission p ON rp.PermissionID = p.PermissionID
                    WHERE rp.RoleID = @RoleID
                `);

            employee.Permissions = permResult.recordset.map(p => p.PermissionKey);

            return employee;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EmployeeModel;
