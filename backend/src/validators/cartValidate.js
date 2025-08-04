const { body, validationResult } = require('express-validator');

const validateCart = [
  body('user_id')
    .notEmpty().withMessage('user_id es obligatorio')
    .isUUID().withMessage('user_id debe ser un UUID válido'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('items debe ser un arreglo con al menos un ítem')
    .bail(),

  body('items.*.product_size_id')
    .notEmpty().withMessage('product_size_id es obligatorio')
    .isUUID().withMessage('product_size_id debe ser un UUID válido'),

  body('items.*.quantity')
    .notEmpty().withMessage('quantity es obligatorio')
    .isInt({ min: 1 }).withMessage('quantity debe ser un entero mayor a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateCart };
