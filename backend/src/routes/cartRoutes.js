const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateCart } = require('../validators/cartValidate');
const { checkOwnership } = require('../middlewares/checkOwnership'); // si tienes este middleware

// Obtener todos los carritos (solo admin)
router.get('/', verifyToken, checkRole('admin'), cartController.getAllCarts);

// Obtener carrito por ID (dueño o admin)
router.get('/:id', verifyToken, checkOwnership('cart'), cartController.getCartById);

// Crear carrito (solo admin)
router.post('/', verifyToken, checkRole('admin'), validateCart, cartController.createCart);

// Actualizar carrito (solo admin)
router.put('/:id', verifyToken, checkRole('admin'), validateCart, cartController.updateCart);

// Eliminar carrito (dueño o admin)
router.delete('/:id', verifyToken, checkOwnership('cart'), cartController.deleteCart);

module.exports = router;
