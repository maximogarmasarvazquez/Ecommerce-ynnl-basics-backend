const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un carrito para un usuario
exports.createCart = async (req, res) => {
  try {
    const { userId } = req.body;

    // Opcional: validar que el usuario existe

    const cart = await prisma.cart.create({
      data: {
        user_id: userId,
      },
      include: {
        user: true,
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              }
            }
          }
        }
      },
    });

    res.status(201).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
};

// Obtener carrito por ID
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              }
            }
          }
        },
        user: true,
      },
    });

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// Actualizar carrito (por ejemplo, cambiar el usuario asignado)
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
              include: {
                product: true,
              }
            }
          }
        }
      },
    });

    res.json(updatedCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
};

// Eliminar carrito
exports.deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.cart.delete({ where: { id } });
    res.json({ message: 'Carrito eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el carrito' });
  }
};

// Obtener todos los carritos (opcional)
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await prisma.cart.findMany({
      include: {
        user: true,
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              }
            }
          }
        }
      },
    });
    res.json(carts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener carritos' });
  }
};
