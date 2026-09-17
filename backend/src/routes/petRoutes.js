const express = require('express');
const auth = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorizeMiddleware');
const ctrl = require('../controllers/petController');

const router = express.Router();

router.use(auth);

router.get('/', ctrl.listPets);
router.get('/:id', ctrl.getPet);
router.post('/', authorize('CLIENTE', 'ADMINISTRADOR'), ctrl.createPet);
router.put('/:id', authorize('CLIENTE', 'ADMINISTRADOR'), ctrl.updatePet);
router.delete('/:id', authorize('CLIENTE', 'ADMINISTRADOR'), ctrl.deletePet);

router.get('/:id/medical-records', ctrl.getPetMedicalRecords);
router.post('/:id/medical-records', authorize('VETERINARIO'), ctrl.createPetMedicalRecord);

module.exports = router;
