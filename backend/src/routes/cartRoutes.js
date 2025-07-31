const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateCart } = require('../validators/cartValidate');
// Obtener todos los carritos (sólo admin)
router.get('/', verifyToken, checkRole('admin'), cartController.getAllCarts);

// Obtener carrito por ID (usuario dueño o admin)
router.get('/:id', verifyToken, cartController.getCartById);

router.post('/', verifyToken, checkRole('admin'), validateCart, cartController.createCart);
router.put('/:id', verifyToken, checkRole('admin'), validateCart, cartController.updateCart);

// Eliminar carrito por ID (usuario dueño o admin)
router.delete('/:id', verifyToken, cartController.deleteCart);

module.exports = router;
