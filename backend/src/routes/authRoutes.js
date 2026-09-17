const express = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

router.get('/me', auth, ctrl.me);
router.put('/change-password', auth, ctrl.changePassword);
router.put('/profile', auth, ctrl.updateProfile);

module.exports = router;
