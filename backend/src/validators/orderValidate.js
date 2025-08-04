const { body, validationResult } = require('express-validator');

const validateOrder = [
body('shipping_id')
  .notEmpty().withMessage('shipping_id es obligatorio')
  .isUUID().withMessage('shipping_id debe ser un UUID válido')
  .trim(),
  
body('address_id')
  .optional()
  .isUUID().withMessage('address_id debe ser un UUID válido')
  .trim(),

  body('items')
    .isArray({ min: 1 }).withMessage('Debe haber al menos un item en la orden'),

  body('items.*.product_size_id')
    .notEmpty().withMessage('Cada item debe tener product_size_id')
    .isUUID().withMessage('product_size_id debe ser un UUID válido'),

  body('items.*.quantity')
    .notEmpty().withMessage('Cada item debe tener quantity')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateOrder };
