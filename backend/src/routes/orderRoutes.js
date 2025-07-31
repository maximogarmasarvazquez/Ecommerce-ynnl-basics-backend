const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateOrder } = require('../validators/orderValidate'); // si usás validación

// Solo admin puede obtener todas las órdenes, actualizar y eliminar
router.get('/', verifyToken, checkRole('admin'), orderController.getAllOrders);
router.put('/:id', verifyToken, checkRole('admin'), validateOrder , orderController.updateOrder);
router.delete('/:id', verifyToken, checkRole('admin'), orderController.deleteOrder);

// Creación y obtener órdenes por usuario requieren autenticación (cualquiera autenticado)
// Crear orden (usuario autenticado puede crear su propia orden, no admin check necesario)
router.post('/', verifyToken, validateOrder, orderController.createOrder);

// Obtener órdenes por usuario (puede ser público o con token)
// Si querés que solo el usuario o admin vea sus órdenes, deberías hacer un middleware especial o poner checkRole condicional en controlador
router.get('/user/:userId', verifyToken, orderController.getOrdersByUser);

// Obtener orden por id (puede ser público o protegido, acá te dejo autenticado)
router.get('/:id', verifyToken, orderController.getOrderById);

module.exports = router;
