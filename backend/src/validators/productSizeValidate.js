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
    .isFloat({ gt: 0 }).withMessage('El weight debe ser un número decimal mayor que 0'),

  body('productId')
    .notEmpty().withMessage('El productId es obligatorio')
    .isUUID().withMessage('El productId debe ser un UUID válido'),

  // Opcionales para dimensiones
  body('length')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El length debe ser un número positivo'),

  body('width')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El width debe ser un número positivo'),

  body('height')
    .optional()
    .isFloat({ gt: 0 }).withMessage('El height debe ser un número positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateProductSize };
