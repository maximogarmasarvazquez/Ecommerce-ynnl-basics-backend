const { body, validationResult } = require('express-validator');

const validateShipping = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser una cadena de texto'),

  body('base_price')
    .notEmpty().withMessage('El precio base es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El precio base debe ser un número mayor a 0'),

  body('price_per_kilo')
    .notEmpty().withMessage('El precio por kilo es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El precio por kilo debe ser un número mayor a 0'),

  body('estimated_days')
    .notEmpty().withMessage('Los días estimados son obligatorios')
    .isInt({ gt: 0 }).withMessage('Los días estimados deben ser un entero mayor a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateShipping };
