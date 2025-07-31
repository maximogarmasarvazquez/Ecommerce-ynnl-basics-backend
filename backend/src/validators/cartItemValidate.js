const validateCartItems = async (req, res, next) => {
  try {
    const itemId = req.params.id;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    if (cartItem.cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este item' });
    }

    next();
  } catch (error) {
    console.error('Error validando propiedad del item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { validateCartItems };
