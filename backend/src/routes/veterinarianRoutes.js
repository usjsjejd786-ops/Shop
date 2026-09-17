const express = require('express');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorizeMiddleware');
const ctrl = require('../controllers/veterinarianController');

const router = express.Router();

router.use(auth);

router.get('/', ctrl.listVeterinarians);
router.post('/', authorize('ADMINISTRADOR'), ctrl.createVeterinarian);
router.put('/:id', authorize('ADMINISTRADOR'), ctrl.updateVeterinarian);
router.get('/:id/agenda', authorize('ADMINISTRADOR'), ctrl.getVeterinarianAgenda);

module.exports = router;
