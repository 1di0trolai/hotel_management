const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// GET /api/employees
router.get('/', employeeController.getAllEmployees);

// GET /api/employees/roles
router.get('/roles', employeeController.getRoles);

// POST /api/employees
router.post('/', employeeController.addEmployee);

// DELETE /api/employees/:id
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
