const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un item en el carrito
exports.createCartItem = async (req, res) => {
  try {
    const { cart_id, product_size_id, quantity } = req.body;

    if (!cart_id || !product_size_id || !quantity) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // (Opcional) Validar que el product_size_id existe y tiene stock disponible

    const newCartItem = await prisma.cartItem.create({
      data: {
        cart_id,
        product_size_id,
        quantity,
      },
      include: {
        productSize: true,  // ahora se incluye productSize, no product
        cart: true,
      },
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error al crear cart item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los items de un carrito
exports.getCartItemsByCartId = async (req, res) => {
  try {
    const { cartId } = req.params;

    const items = await prisma.cartItem.findMany({
      where: { cart_id: cartId },
      include: { productSize: true },  // incluir productSize, no product
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener items del carrito' });
  }
};

// Actualizar cantidad de un item en el carrito
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // id del CartItem
    const { quantity } = req.body;

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar item del carrito' });
  }
};

// Eliminar item del carrito
exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cartItem.delete({ where: { id } });

    res.json({ message: 'Item eliminado del carrito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar item del carrito' });
  }
};
