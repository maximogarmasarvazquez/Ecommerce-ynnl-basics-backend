const { body, param, validationResult } = require('express-validator');

// Middleware para validar resultado de validación
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateCategory = [
  body('name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto')
    .trim(),
  checkValidation,
];

const validateCategoryIdParam = [
  param('id')
    .isUUID().withMessage('ID inválido'),
  checkValidation,
];

module.exports = { validateCategory, validateCategoryIdParam };
