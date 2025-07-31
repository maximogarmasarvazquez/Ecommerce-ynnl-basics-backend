// middlewares/validateShipping.js
const { body, validationResult } = require('express-validator');

const validateShipping = [
  body('name').isString().notEmpty().withMessage('El nombre es obligatorio'),
  body('base_price').isFloat({ gt: 0 }).withMessage('El precio base debe ser un número mayor a 0'),
  body('price_per_kilo').isFloat({ gt: 0 }).withMessage('El precio por kilo debe ser un número mayor a 0'),
  body('estimated_days').isInt({ gt: 0 }).withMessage('Los días estimados deben ser un entero mayor a 0'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateShipping };
