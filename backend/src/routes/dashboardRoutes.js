const express = require('express');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorizeMiddleware');
const ctrl = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', auth, authorize('ADMINISTRADOR'), ctrl.getDashboard);

module.exports = router;
