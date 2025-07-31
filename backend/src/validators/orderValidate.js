const { body, validationResult } = require('express-validator');

const validateOrder = [
  // user_id solo en creación (POST), no en update
  body('user_id')
    .if((value, { req }) => req.method === 'POST')
    .notEmpty()
    .withMessage('El campo user_id es obligatorio')
    .isUUID()
    .withMessage('user_id debe ser un UUID válido'),

  body('shipping_id')
    .notEmpty()
    .withMessage('El campo shipping_id es obligatorio')
    .isUUID()
    .withMessage('shipping_id debe ser un UUID válido'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Debe haber al menos un item en el pedido'),

  body('items.*.product_size_id')
    .notEmpty()
    .withMessage('Cada item debe tener product_size_id')
    .isUUID()
    .withMessage('product_size_id debe ser un UUID válido'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Cada item debe tener quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),

  // middleware para enviar errores si los hay
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateOrder };
