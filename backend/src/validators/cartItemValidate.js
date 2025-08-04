const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkCartItemOwnership = async (req, res, next) => {
  try {
    const itemId = req.params.id;

    if (!req.user?.id) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Ítem no encontrado' });
    }

    if (cartItem.cart.user_id !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este ítem' });
    }

    next();
  } catch (error) {
    console.error('Error validando propiedad del ítem:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { checkCartItemOwnership };
