const express = require('express');
const router = express.Router();

const cartItemController = require('../controllers/cartItemController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateCartItemOwnership } = require('../validators/cartItemValidate');
const { checkOwnership } = require('../middlewares/checkOwnership'); // valida propiedad

// Crear ítem solo si es dueño del carrito
router.post('/', verifyToken, validateCartItemOwnership, cartItemController.createCartItem);

// Obtener items de un carrito solo si es dueño
router.get('/:cartId', verifyToken, cartItemController.getCartItemsByCartId);

// Actualizar ítem, validar propiedad
router.put('/:id', verifyToken, checkOwnership('cartItem'), validateCartItemOwnership, cartItemController.updateCartItem);

// Eliminar ítem, validar propiedad
router.delete('/:id', verifyToken, checkOwnership('cartItem'), cartItemController.deleteCartItem);

module.exports = router;
