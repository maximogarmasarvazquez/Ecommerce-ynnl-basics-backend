// validators/productValidator.js
const { body } = require('express-validator');

exports.validateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres.'),

  body('description')
    .notEmpty().withMessage('La descripción es obligatoria.'),

  body('price')
    .notEmpty().withMessage('El precio es obligatorio.')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo.'),

  body('image')
    .notEmpty().withMessage('La imagen es obligatoria.')
    .isURL().withMessage('Debe ser una URL válida.'),

  body('category_id')
    .notEmpty().withMessage('La categoría es obligatoria.')
    .isUUID().withMessage('El ID de categoría debe ser un UUID válido.'),

  body('sizes').isArray({ min: 1 }).withMessage('Debes enviar al menos un talle.'),
  body('sizes.*.size')
    .notEmpty().withMessage('Cada talle debe tener un nombre.'),
  body('sizes.*.stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.'),
  body('sizes.*.weight')
    .isFloat({ min: 0 }).withMessage('El peso debe ser un número positivo.'),
];
