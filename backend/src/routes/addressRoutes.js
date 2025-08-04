const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateAddress } = require('../validators/addressValidate');
const { checkOwnership } = require('../middlewares/checkOwnership'); // asumido path

router.post('/', verifyToken, validateAddress, addressController.createAddress);
router.get('/', verifyToken, addressController.getUserAddresses);

// Actualizar solo si es dueño o admin
router.put('/:id', verifyToken, checkOwnership('address'), validateAddress, addressController.updateAddress);

// Eliminar solo si es dueño o admin
router.delete('/:id', verifyToken, checkOwnership('address'), addressController.deleteAddress);

// Marcar default solo si es dueño o admin
router.patch('/:id/default', verifyToken, checkOwnership('address'), addressController.setDefaultAddress);

module.exports = router;
