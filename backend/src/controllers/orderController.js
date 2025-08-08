const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear una orden y su pago (anidado)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_id, address_id, items } = req.body;

    if (!shipping_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios o items inválidos' });
    }

    // Validar dirección si se pasa y que pertenezca al usuario o admin
    if (address_id) {
      const address = await prisma.address.findUnique({ where: { id: address_id } });
      if (!address) return res.status(400).json({ error: 'Dirección inválida' });
      if (address.user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para usar esta dirección' });
      }
    }

    // Validar productSizes y cargar productos
    const productSizeIds = items.map(i => i.product_size_id);
    const productSizes = await prisma.productSize.findMany({
      where: { id: { in: productSizeIds } },
      include: { product: true },
    });

    if (productSizes.length !== productSizeIds.length) {
      return res.status(400).json({ error: 'Algún product_size_id no existe' });
    }

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

    // Crear orden junto con el pago (nested create)
    const newOrder = await prisma.order.create({
      data: {
        user_id: userId,
        shipping_id,
        address_id: address_id || null,
        total,
        items: {
          create: items.map(item => ({
            product_size_id: item.product_size_id,
            quantity: item.quantity,
            price: psMap[item.product_size_id].product.price,
            product_id: psMap[item.product_size_id].product_id,
          })),
        },
        payment: {
          create: {
            payment_method: 'mercado_pago', // Cambiar si usás otro método
            status: 'pending',
            amount: total,
          },
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
        address: true,
        payment: true,
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
    const whereClause = req.user.role === 'admin' ? {} : { user_id: req.user.id };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        shipping: true,
        address: true,
        items: {
          include: {
            productSize: { include: { product: true } },
          },
        },
        payment: true,
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
        address: true,
        items: {
          include: {
            productSize: { include: { product: true } },
          },
        },
        payment: true,
      },
    });

    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para ver esta orden' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
};

// Actualizar orden
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipping_id } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta orden' });
    }

    if (!shipping_id) {
      return res.status(400).json({ error: 'shipping_id es obligatorio para actualizar' });
    }

    const shipping = await prisma.shipping.findUnique({ where: { id: shipping_id } });
    if (!shipping) {
      return res.status(400).json({ error: 'Método de envío inválido' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        shipping_id,
        updated_at: new Date(),
      },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  }
};

// Eliminar orden
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta orden' });
    }

    await prisma.order.delete({ where: { id } });

    res.json({ message: 'Orden eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ error: 'Error al eliminar orden' });
  }
};
