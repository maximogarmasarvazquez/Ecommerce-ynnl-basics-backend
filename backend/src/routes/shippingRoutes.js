const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateShipping } = require('../validators/shippingValidate');

// Solo admin puede crear, actualizar y eliminar métodos de envío
router.post('/', verifyToken, checkRole('admin'), validateShipping, shippingController.createShipping);
router.put('/:id', verifyToken, checkRole('admin'), validateShipping, shippingController.updateShipping);
router.delete('/:id', verifyToken, checkRole('admin'), shippingController.deleteShipping);

// Rutas públicas para obtener métodos de envío
router.get('/', shippingController.getAllShippings);
router.get('/:id', shippingController.getShippingById);

module.exports = router;
