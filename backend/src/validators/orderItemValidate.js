const { body, validationResult } = require('express-validator');

const validateOrderItem = [
  body('order_id')
    .notEmpty()
    .withMessage('El campo order_id es obligatorio')
    .isUUID()
    .withMessage('order_id debe ser un UUID válido'),

  body('product_id')
    .notEmpty()
    .withMessage('El campo product_id es obligatorio')
    .isUUID()
    .withMessage('product_id debe ser un UUID válido'),

  body('product_size_id')
    .notEmpty()
    .withMessage('El campo product_size_id es obligatorio')
    .isUUID()
    .withMessage('product_size_id debe ser un UUID válido'),

  body('quantity')
    .notEmpty()
    .withMessage('El campo quantity es obligatorio')
    .isInt({ min: 1 })
    .withMessage('quantity debe ser un número entero mayor o igual a 1'),

  body('price')
    .notEmpty()
    .withMessage('El campo price es obligatorio')
    .isFloat({ gt: 0 })
    .withMessage('price debe ser un número decimal mayor a 0'),

  // Middleware para enviar errores si los hay
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateOrderItem };
