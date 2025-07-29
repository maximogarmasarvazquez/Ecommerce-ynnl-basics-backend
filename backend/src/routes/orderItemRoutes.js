const express = require('express');
const router = express.Router();

const orderItemController = require('../controllers/orderItemController');

// Crear OrderItem
router.post('/', orderItemController.createOrderItem);

// Obtener todos los OrderItems de una orden
router.get('/order/:orderId', orderItemController.getOrderItemsByOrderId);

// Obtener un OrderItem por ID
router.get('/:id', orderItemController.getOrderItemById);

// Actualizar OrderItem
router.put('/:id', orderItemController.updateOrderItem);

// Eliminar OrderItem
router.delete('/:id', orderItemController.deleteOrderItem);

module.exports = router;
