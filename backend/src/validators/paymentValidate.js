const { body, validationResult } = require('express-validator');

const validatePayment = [
  body('order_id')
    .notEmpty().withMessage('order_id es obligatorio')
    .isUUID().withMessage('order_id debe ser un UUID válido'),

body('payment_method')
  .notEmpty().withMessage('payment_method es obligatorio')
  .isString().withMessage('payment_method debe ser una cadena de texto')
  .trim(),

body('status')
  .notEmpty().withMessage('status es obligatorio')
  .isString().withMessage('status debe ser una cadena de texto')
  .trim(),

body('transaction_id')
  .optional()
  .isString().withMessage('transaction_id debe ser una cadena de texto')
  .trim(),
  
  body('amount')
    .notEmpty().withMessage('amount es obligatorio')
    .isFloat({ gt: 0 }).withMessage('amount debe ser un número mayor que cero'),


  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) 
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

module.exports = { validatePayment };
