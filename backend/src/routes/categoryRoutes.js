const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware.js');
const { validateCategory } = require('../validators/categoryValidate');

router.get('/', verifyToken,categoryController.getAllCategories);
router.get('/:id',verifyToken, categoryController.getCategoryById);

// Solo admin
router.post('/', verifyToken, checkRole('admin'), validateCategory, categoryController.createCategory);
router.put('/:id', verifyToken, checkRole('admin'), validateCategory, categoryController.updateCategory);
router.delete('/:id', verifyToken, checkRole('admin'), categoryController.deleteCategory);

module.exports = router;
