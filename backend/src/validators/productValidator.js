const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser una cadena de texto'),

  body('description')
    .optional()
    .isString().withMessage('La descripción debe ser una cadena de texto'),

  body('price')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0'),

  body('image')
    .notEmpty().withMessage('La imagen es obligatoria')
    .isURL().withMessage('La imagen debe ser una URL válida'),

  body('category_id')
    .notEmpty().withMessage('La categoría es obligatoria')
    .isUUID().withMessage('category_id debe ser un UUID válido'),

  body('sizes')
    .isArray({ min: 1 }).withMessage('Debe haber al menos un tamaño'),

  body('sizes.*.size')
    .notEmpty().withMessage('Cada tamaño debe tener un valor válido')
    .isString().withMessage('El tamaño debe ser una cadena de texto'),

  body('sizes.*.stock')
    .notEmpty().withMessage('Cada tamaño debe tener stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0'),

  body('sizes.*.weight')
    .notEmpty().withMessage('Cada tamaño debe tener peso')
    .isFloat({ min: 0 }).withMessage('El peso debe ser un número mayor o igual a 0'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateProduct };
