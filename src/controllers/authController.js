const GuestModel = require('../models/guestModel');
const EmployeeModel = require('../models/employeeModel');

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const guest = await GuestModel.register(firstName, lastName, email, password);
        res.status(201).json({ message: 'Registration successful', guest });
    } catch (error) {
        if (error.message === 'Email already exists') {
            return res.status(409).json({ message: error.message });
        }
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const guest = await GuestModel.login(email, password);
        if (!guest) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.status(200).json({ message: 'Login successful', guest });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.employeeLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        const employee = await EmployeeModel.login(email, password);
        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.status(200).json({ message: 'Login successful', employee });
    } catch (error) {
        console.error("Employee Login Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
