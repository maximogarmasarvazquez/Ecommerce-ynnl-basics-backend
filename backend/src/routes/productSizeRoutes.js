const express = require('express');
const router = express.Router();
const productSizeController = require('../controllers/productSizeController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validateProductSize } = require('../validators/productSizeValidate');

// Solo admin puede crear, actualizar y eliminar
router.post(
  '/',
  verifyToken,
  checkRole('admin'),
  validateProductSize,
  productSizeController.createProductSize
);

router.put(
  '/:id',
  verifyToken,
  checkRole('admin'),
  validateProductSize,
  productSizeController.updateProductSize
);

router.delete(
  '/:id',
  verifyToken,
  checkRole('admin'),
  productSizeController.deleteProductSize
);

// Rutas públicas para ver talles
router.get('/', productSizeController.getAllProductSizes);
router.get('/:id', productSizeController.getProductSizeById);

module.exports = router;
