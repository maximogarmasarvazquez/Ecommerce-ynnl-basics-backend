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

  body('product_id')  // aquí el cambio
    .notEmpty().withMessage('El product_id es obligatorio')
    .isUUID().withMessage('El product_id debe ser un UUID válido'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateProductSize };
