const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const checkPermission = require('../middleware/checkPermission');

// GET /api/employees
router.get('/', checkPermission('manage_employees'), employeeController.getAllEmployees);

// GET /api/employees/roles
router.get('/roles', checkPermission('manage_employees'), employeeController.getRoles);

// POST /api/employees
router.post('/', checkPermission('manage_employees'), employeeController.addEmployee);

// DELETE /api/employees/:id
router.delete('/:id', checkPermission('manage_employees'), employeeController.deleteEmployee);

module.exports = router;
