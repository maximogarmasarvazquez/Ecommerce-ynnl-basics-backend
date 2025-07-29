const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');

// Crear un carrito
router.post('/', cartController.createCart);

// Obtener todos los carritos
router.get('/', cartController.getAllCarts);

// Obtener carrito por ID
router.get('/:id', cartController.getCartById);

// Actualizar carrito por ID
router.put('/:id', cartController.updateCart);

// Eliminar carrito por ID
router.delete('/:id', cartController.deleteCart);

module.exports = router;
