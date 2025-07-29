const express = require('express');
const router = express.Router();

const cartItemController = require('../controllers/cartItemController');

router.post('/', cartItemController.createCartItem);              // Crear item
router.get('/:cartId', cartItemController.getCartItemsByCartId);  // Obtener items de un carrito por cartId
router.put('/:id', cartItemController.updateCartItem);            // Actualizar item por id
router.delete('/:id', cartItemController.deleteCartItem);         // Eliminar item por id

module.exports = router;
