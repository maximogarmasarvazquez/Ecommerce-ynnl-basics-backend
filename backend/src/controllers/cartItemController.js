const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un nuevo ítem en el carrito
exports.createCartItem = async (req, res) => {
  try {
    const { cart_id, product_size_id, quantity } = req.body;

    if (!cart_id || !product_size_id || !quantity) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Validar que el carrito exista y sea del usuario
    const cart = await prisma.cart.findUnique({ where: { id: cart_id } });
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    if (cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
    }

    // Buscamos el ProductSize y product_id
    const productSize = await prisma.productSize.findUnique({
      where: { id: product_size_id },
      include: { product: true },
    });

    if (!productSize) {
      return res.status(404).json({ error: 'El product_size_id no existe' });
    }

    const product_id = productSize.product_id;

    // Crear el ítem en el carrito usando `connect`
    const newCartItem = await prisma.cartItem.create({
      data: {
        quantity,
        cart: { connect: { id: cart_id } },
        productSize: { connect: { id: product_size_id } },
        product: { connect: { id: product_id } },
      },
      include: {
        productSize: { include: { product: true } },
        product: true,
      },
    });

    res.status(201).json(newCartItem);
  } catch (error) {
    console.error('Error al crear cart item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todos los ítems de un carrito (validar propiedad)
exports.getCartItemsByCartId = async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    if (cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver este carrito' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cart_id: cartId },
      include: {
        product: true,
        productSize: true,
      },
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error al obtener cart items:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un ítem del carrito (validar propiedad)
exports.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar item con carrito relacionado para validar propiedad
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });
    if (!cartItem) return res.status(404).json({ error: 'Item no encontrado' });
    if (cartItem.cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este item' });
    }

    await prisma.cartItem.delete({ where: { id } });

    res.status(200).json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cart item:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un ítem del carrito (validar propiedad)
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, product_size_id } = req.body;

    if (!quantity || !product_size_id) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Validar que el cartItem exista y sea del usuario
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });
    if (!cartItem) return res.status(404).json({ error: 'Item no encontrado' });
    if (cartItem.cart.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este item' });
    }

    // Validar que el product_size_id exista y obtener product_id actualizado
    const productSize = await prisma.productSize.findUnique({
      where: { id: product_size_id },
    });
    if (!productSize) {
      return res.status(404).json({ message: 'El product_size_id no existe' });
    }

    const product_id = productSize.product_id;

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity,
        product_size_id,
        product_id,
      },
      include: {
        product: true,
        productSize: true,
      },
    });

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error al actualizar el cart item:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};
