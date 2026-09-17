const express = require('express');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorizeMiddleware');
const ctrl = require('../controllers/serviceController');

const router = express.Router();

router.use(auth);

router.get('/', ctrl.listServices);
router.get('/:id', ctrl.getService);
router.post('/', authorize('ADMINISTRADOR'), ctrl.createService);
router.put('/:id', authorize('ADMINISTRADOR'), ctrl.updateService);
router.delete('/:id', authorize('ADMINISTRADOR'), ctrl.deleteService);

module.exports = router;
