const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateCart } = require('../validators/cartValidate');
const { checkOwnership } = require('../middlewares/checkOwnership');

// Rutas para CLIENTES autenticados
router.get('/me', verifyToken, cartController.getMyCart);
router.post('/add', verifyToken, cartController.addToCart);
router.patch('/item/:itemId', verifyToken, cartController.updateItemQuantity);
router.delete('/item/:itemId', verifyToken, cartController.removeItemFromCart);
router.delete('/mine', verifyToken, cartController.clearMyCart);

// Rutas para ADMIN
router.get('/', verifyToken, checkRole('admin'), cartController.getAllCarts);
router.get('/:id', verifyToken, checkOwnership('cart'), cartController.getCartById);
router.put('/:id', verifyToken, checkRole('admin'), validateCart, cartController.updateCart);
router.delete('/:id', verifyToken, checkOwnership('cart'), cartController.deleteCart);

module.exports = router;
