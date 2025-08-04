const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { validatePayment } = require('../validators/paymentValidate');

// Crear pago (solo admin o cliente autenticado)
router.post('/', verifyToken, validatePayment, paymentController.createPayment);

// Obtener todos los pagos (admin solo)
router.get('/', verifyToken, checkRole('admin'), paymentController.getAllPayments);

// Obtener pago por ID (autenticado)
router.get('/:id', verifyToken, paymentController.getPaymentById);

// Actualizar pago (solo admin)
router.put('/:id', verifyToken, checkRole('admin'), validatePayment, paymentController.updatePayment);

// Eliminar pago (solo admin)
router.delete('/:id', verifyToken, checkRole('admin'), paymentController.deletePayment);

module.exports = router;
