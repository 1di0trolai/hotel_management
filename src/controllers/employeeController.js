const EmployeeModel = require('../models/employeeModel');
const bcrypt = require('bcryptjs');

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await EmployeeModel.getAllEmployees();
        res.status(200).json(employees);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const { roleId, firstName, lastName, email, password } = req.body;
        
        if (!roleId || !firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Only Admins can create other Admin accounts. A Manager creating an
        // employee with the Admin role would be a privilege escalation, so we
        // verify the target role here regardless of what the client sent.
        if (req.employeeRole !== 'Admin') {
            const targetRole = await EmployeeModel.getRoleById(roleId);
            if (targetRole && targetRole.RoleTitle === 'Admin') {
                return res.status(403).json({ message: 'Only an Admin can create another Admin account.' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Use a default HotelCode of 1 since we only have one hotel
        const hotelCode = 1;

        const employee = await EmployeeModel.createEmployee(hotelCode, roleId, firstName, lastName, email, hashedPassword);
        res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (error) {
        if (error.message.includes('Violation of UNIQUE KEY constraint')) {
            return res.status(409).json({ message: 'Email already exists' });
        }
        console.error("Error creating employee:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const target = await EmployeeModel.getEmployeeById(employeeId);
        if (!target) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Only an Admin can delete another Admin account.
        if (target.RoleTitle === 'Admin' && req.employeeRole !== 'Admin') {
            return res.status(403).json({ message: 'Only an Admin can delete an Admin account.' });
        }

        await EmployeeModel.deleteEmployee(employeeId);
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await EmployeeModel.getAllRoles();
        res.status(200).json(roles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
