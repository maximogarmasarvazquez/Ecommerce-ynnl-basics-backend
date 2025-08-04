const { body, validationResult } = require('express-validator');

const validateOrderItem = [
  body('order_id')
    .notEmpty().withMessage('order_id es obligatorio')
    .isUUID().withMessage('order_id debe ser un UUID válido')
    .trim(),

  body('product_size_id')
    .notEmpty().withMessage('product_size_id es obligatorio')
    .isUUID().withMessage('product_size_id debe ser un UUID válido')
    .trim(),

  body('quantity')
    .notEmpty().withMessage('quantity es obligatorio')
    .isInt({ min: 1 }).withMessage('quantity debe ser un número entero mayor o igual a 1'),

  body('price')
    .notEmpty().withMessage('price es obligatorio')
    .isFloat({ min: 0 }).withMessage('price debe ser un número positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateOrderItem };
