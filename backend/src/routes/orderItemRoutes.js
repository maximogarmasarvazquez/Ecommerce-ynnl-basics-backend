const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateOrderItem } = require('../validators/orderItemValidate');

// Crear OrderItem (solo admin)
router.post('/', verifyToken, checkRole('admin'), validateOrderItem, orderItemController.createOrderItem);

// Obtener todos los OrderItems de una orden (autenticado)
router.get('/order/:orderId', verifyToken, orderItemController.getOrderItemsByOrderId);

// Obtener un OrderItem por ID (autenticado)
router.get('/:id', verifyToken, orderItemController.getOrderItemById);

// Actualizar OrderItem (solo admin)
router.put('/:id', verifyToken, checkRole('admin'), validateOrderItem, orderItemController.updateOrderItem);

// Eliminar OrderItem (solo admin)
router.delete('/:id', verifyToken, checkRole('admin'), orderItemController.deleteOrderItem);

module.exports = router;
