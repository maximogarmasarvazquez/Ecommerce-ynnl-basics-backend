const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validateCartItems } = require('../validators/cartItemValidate');

// Crear ítem solo si es dueño del carrito
router.post('/', verifyToken, validateCartItems, cartItemController.createCartItem);

// Obtener items de un carrito solo si es dueño
router.get('/:cartId', verifyToken, validateCartItems, cartItemController.getCartItemsByCartId);

// Actualizar ítem, validar propiedad
router.put('/:id', verifyToken, validateCartItems, cartItemController.updateCartItem);

// Eliminar ítem, validar propiedad
router.delete('/:id', verifyToken, validateCartItems, cartItemController.deleteCartItem);

module.exports = router;
