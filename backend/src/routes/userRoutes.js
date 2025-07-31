const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');


// Registro y login (público)

router.post('/register', authController.validateRegister, authController.register);
router.post('/login', authController.validateLogin, authController.login);

// Creación de usuario con rol (sólo admin)
router.post('/', verifyToken, checkRole('admin'), userController.createUser);

// Otras rutas de usuario protegidas
router.get('/', verifyToken, checkRole('admin'), userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById); // mismo
router.put('/:id', verifyToken,  userController.updateUser);
router.delete('/:id', verifyToken, userController.deleteUser); // solo admin puede borrar

module.exports = router;