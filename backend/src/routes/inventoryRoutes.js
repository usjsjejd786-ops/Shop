const express = require('express');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorizeMiddleware');
const ctrl = require('../controllers/inventoryController');

const router = express.Router();

// Estoque é restrito a administradores.
router.use(auth, authorize('ADMINISTRADOR'));

router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', ctrl.createProduct);
router.put('/:id', ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);
router.post('/:id/movement', ctrl.registerMovement);

module.exports = router;
