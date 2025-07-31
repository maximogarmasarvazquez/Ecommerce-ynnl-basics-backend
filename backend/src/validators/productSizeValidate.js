const { body, validationResult } = require('express-validator');

const validateProductSize = [
  body('size')
    .trim()
    .notEmpty().withMessage('El campo size es obligatorio')
    .isLength({ max: 10 }).withMessage('El size debe tener máximo 10 caracteres'),

  body('stock')
    .notEmpty().withMessage('El stock es obligatorio')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),

  body('weight')
    .notEmpty().withMessage('El weight es obligatorio')
    .isFloat({ min: 0 }).withMessage('El weight debe ser un número decimal mayor o igual a 0'),

  body('productId')
    .notEmpty().withMessage('El productId es obligatorio')
    .isUUID().withMessage('El productId debe ser un UUID válido'),

  // Middleware para enviar errores si los hay
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateProductSize };
