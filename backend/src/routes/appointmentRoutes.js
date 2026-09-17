const express = require('express');
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/appointmentController');

const router = express.Router();

router.use(auth);

router.get('/', ctrl.listAppointments);
router.get('/:id', ctrl.getAppointment);
router.post('/', ctrl.createAppointment);
router.put('/:id', ctrl.updateAppointment);
router.delete('/:id', ctrl.cancelAppointment);

module.exports = router;
