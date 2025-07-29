const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear una orden
exports.createOrder = async (req, res) => {
  try {
    const { user_id, shipping_id, items } = req.body;

    if (!user_id || !shipping_id || !items || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Obtener datos de los ProductSize en una sola llamada
    const productSizeIds = items.map(i => i.product_size_id);
    const productSizes = await prisma.productSize.findMany({
      where: { id: { in: productSizeIds } },
      include: { product: true },
    });

    if (productSizes.length !== productSizeIds.length) {
      return res.status(400).json({ error: 'Algún product_size_id no existe' });
    }

    // Mapear productSizes por id para acceso rápido
    const psMap = {};
    productSizes.forEach(ps => psMap[ps.id] = ps);

    // Calcular total y peso
    let total = 0;
    let totalWeight = 0;

    for (const item of items) {
      const ps = psMap[item.product_size_id];
      total += ps.product.price * item.quantity;
      totalWeight += ps.weight * item.quantity;
    }

    // Obtener método de envío
    const shipping = await prisma.shipping.findUnique({ where: { id: shipping_id } });
    if (!shipping) {
      return res.status(400).json({ error: 'Método de envío no válido' });
    }

    const shippingCost = shipping.base_price + shipping.price_per_kilo * totalWeight;
    total += shippingCost;

    // Crear orden con items
    const newOrder = await prisma.order.create({
      data: {
        user_id,
        shipping_id,
        total,
        items: {
          create: items.map(item => ({
            product_size_id: item.product_size_id,
            quantity: item.quantity,
            price: psMap[item.product_size_id].product.price,
            product_id: psMap[item.product_size_id].product_id,
          })),
        },
      },
      include: {
        items: {
          include: {
            productSize: { include: { product: true } },
          },
        },
        shipping: true,
        user: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
};


// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        shipping: true,
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

// Obtener una orden por ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        shipping: true,
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    res.json(order);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
};

// Eliminar orden
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.order.delete({ where: { id } });

    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ error: 'Error al eliminar orden' });
  }
};

// (Opcional) Obtener órdenes de un usuario
exports.getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      include: {
        shipping: true,
        items: {
          include: {
            productSize: {
              include: { product: true },
            },
          },
        },
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes del usuario:', error);
    res.status(500).json({ error: 'Error al obtener órdenes del usuario' });
  }
};

// Actualizar una orden
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_id, items } = req.body;

    // Por simplicidad, no permitimos actualizar el user_id
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        shipping_id,
        updated_at: new Date(),
        // Si querés actualizar los items, hay que hacer lógica adicional con deleteMany/create
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
};