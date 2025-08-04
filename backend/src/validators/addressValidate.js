const { body, validationResult } = require('express-validator');

const validateAddress = [
  body('street')
    .notEmpty().withMessage('La calle (street) es obligatoria')
    .isString().withMessage('street debe ser una cadena de texto')
    .trim(),

  body('city')
    .notEmpty().withMessage('La ciudad (city) es obligatoria')
    .isString().withMessage('city debe ser una cadena de texto')
    .trim(),

  body('state')
    .notEmpty().withMessage('La provincia/estado (state) es obligatoria')
    .isString().withMessage('state debe ser una cadena de texto')
    .trim(),

  body('country')
    .notEmpty().withMessage('El país (country) es obligatorio')
    .isString().withMessage('country debe ser una cadena de texto')
    .trim(),

  body('postal_code')
    .notEmpty().withMessage('El código postal (postal_code) es obligatorio')
    .isPostalCode('any').withMessage('postal_code debe ser un código postal válido')
    .trim(),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone('any').withMessage('phone debe ser un número de teléfono válido')
    .trim(),

  body('is_default')
    .optional()
    .toBoolean()
    .isBoolean().withMessage('is_default debe ser un valor booleano'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateAddress };
