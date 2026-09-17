const express = require('express');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorizeMiddleware');
const ctrl = require('../controllers/userController');

const router = express.Router();

// Toda a gestão de usuários é restrita ao administrador.
router.use(auth, authorize('ADMINISTRADOR'));

router.get('/', ctrl.listUsers);
router.get('/:id', ctrl.getUser);
router.post('/', ctrl.createUser);
router.put('/:id', ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
