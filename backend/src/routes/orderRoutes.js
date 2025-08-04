const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateOrder } = require('../validators/orderValidate');
const { checkOwnership } = require('../middlewares/checkOwnership');

// Solo admin o dueño pueden actualizar/eliminar/obtener por ID
router.get('/', verifyToken, checkRole('admin'), orderController.getAllOrders);
router.get('/:id', verifyToken, checkOwnership('order'), orderController.getOrderById);
router.post('/', verifyToken, validateOrder, orderController.createOrder);
router.put('/:id', verifyToken, checkOwnership('order'), validateOrder, orderController.updateOrder);
router.delete('/:id', verifyToken, checkOwnership('order'), orderController.deleteOrder);

module.exports = router;
