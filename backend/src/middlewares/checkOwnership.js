const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware genérico para validar que el usuario sea dueño del recurso o admin.
 * @param {string} modelName - Nombre del modelo Prisma (ej: 'order', 'address', 'cartItem', etc.)
 * @param {string} idParam - Nombre del parámetro de ruta con el ID del recurso (default: 'id')
 * @param {string} userField - Nombre del campo en el modelo que referencia al usuario (default: 'user_id')
 */
const checkOwnership = (modelName, idParam = 'id', userField = 'user_id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const userId = req.user.id;
      const userRole = req.user.role;

      // Buscar solo el campo que referencia al dueño
      const resource = await prisma[modelName].findUnique({
        where: { id: resourceId },
        select: { [userField]: true },
      });

      if (!resource) {
        return res.status(404).json({ error: `${modelName} no encontrado` });
      }

      if (userRole !== 'admin' && resource[userField] !== userId) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este recurso' });
      }

      next();
    } catch (error) {
      console.error(`Error validando propiedad de ${modelName}:`, error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

module.exports = { checkOwnership };
