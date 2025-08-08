const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🔐 Cliente: Obtener su propio carrito
exports.getMyCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await prisma.cart.findFirst({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            productSize: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { user_id: userId } });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// ➕ Cliente: Agregar producto al carrito (mejorado)
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_size_id } = req.body;

    if (!product_size_id) {
      return res.status(400).json({ error: "Debe enviar product_size_id" });
    }

    // Obtener o crear carrito
    let cart = await prisma.cart.findFirst({ where: { user_id: userId } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { user_id: userId },
      });
    }

    // Buscar si ya existe item en el carrito para ese product_size_id
    let cartItem = await prisma.cartItem.findFirst({
      where: { cart_id: cart.id, product_size_id },
    });

    if (cartItem) {
      // Incrementar cantidad
      cartItem = await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + 1 },
        include: { productSize: { include: { product: true } }, product: true },
      });
    } else {
      // Obtener product_id para el product_size_id
      const productSize = await prisma.productSize.findUnique({
        where: { id: product_size_id },
      });
      if (!productSize) {
        return res.status(404).json({ error: "ProductSize no encontrado" });
      }

      // Crear nuevo item con relaciones conectadas
      cartItem = await prisma.cartItem.create({
        data: {
          quantity: 1,
          cart: { connect: { id: cart.id } },
          productSize: { connect: { id: product_size_id } },
          product: { connect: { id: productSize.product_id } },
        },
        include: { productSize: { include: { product: true } }, product: true },
      });
    }

    res.json(cartItem);
  } catch (error) {
    console.error("Error en addToCart:", error);
    res.status(500).json({ error: "Error al agregar producto al carrito" });
  }
};

// 🔁 Cliente: Cambiar cantidad de producto
exports.updateItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Si la cantidad es 0 o menos, elimina el ítem
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    res.json({ message: 'Cantidad actualizada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar la cantidad' });
  }
};

// ❌ Cliente: Eliminar producto del carrito
exports.removeItemFromCart = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error("Error en removeItemFromCart:", error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
};

// 🧹 Cliente: Vaciar carrito
exports.clearMyCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await prisma.cart.findFirst({ where: { user_id: userId } });

    if (!cart) {
      return res.json({ message: 'El carrito ya está vacío' });
    }

    await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    res.json({ message: 'Carrito vaciado correctamente' });
  } catch (error) {
    console.error("Error en clearMyCart:", error);
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};

// 📦 ADMIN: Obtener todos los carritos
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await prisma.cart.findMany({
      include: {
        user: true,
        items: {
          include: {
            productSize: {
              include: { product: true }
            }
          }
        }
      }
    });
    res.json(carts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener carritos' });
  }
};

// 🔎 ADMIN/OWNER: Obtener carrito por ID
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const cart = await prisma.cart.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            productSize: {
              include: { product: true }
            }
          }
        }
      }
    });

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (user.role !== 'admin' && cart.user_id !== user.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// ✏️ ADMIN: Actualizar carrito (solo user_id)
exports.updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const updatedCart = await prisma.cart.update({
      where: { id },
      data: { user_id: userId },
      include: {
        user: true,
        items: {
          include: {
            productSize: {
              include: { product: true }
            }
          }
        }
      }
    });

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
};

// 🗑️ ADMIN/OWNER: Eliminar carrito completo
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const cart = await prisma.cart.findUnique({ where: { id } });
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (user.role !== 'admin' && cart.user_id !== user.id) {
      return res.status(403).json({ error: 'No autorizado para eliminar este carrito' });
    }

    await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
    await prisma.cart.delete({ where: { id } });

    res.json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el carrito' });
  }
};
