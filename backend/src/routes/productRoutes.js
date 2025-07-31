const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct } = require('../validators/productValidator');
const handleValidation = require('../middlewares/validationHandler');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Público
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Solo admin puede crear, editar y borrar
router.post('/', verifyToken, checkRole('admin'), validateProduct, handleValidation, productController.createProduct);
router.put('/:id', verifyToken, checkRole('admin'), validateProduct, handleValidation, productController.updateProduct);
router.delete('/:id', verifyToken, checkRole('admin'), productController.deleteProduct);

module.exports = router;
