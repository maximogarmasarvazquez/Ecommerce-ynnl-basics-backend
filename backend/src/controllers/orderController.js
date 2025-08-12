const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipping_id, address_id, items } = req.body;

    // Validaciones básicas
    if (!shipping_id || !address_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios o items inválidos' });
    }

    // Validar dirección
    const address = await prisma.address.findUnique({ where: { id: address_id } });
    if (!address) return res.status(400).json({ error: 'Dirección inválida' });
    if (address.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para usar esta dirección' });
    }

    // Validar método de envío y obtener external_service_code
    const shipping = await prisma.shipping.findUnique({ where: { id: shipping_id } });
    if (!shipping) return res.status(400).json({ error: 'Método de envío inválido' });
    if (!shipping.external_service_code) {
      return res.status(400).json({ error: 'El método de envío no tiene código externo para calcular costo' });
    }

    // Obtener productos y pesos
    const productSizeIds = items.map(i => i.product_size_id);
    const productSizes = await prisma.productSize.findMany({
      where: { id: { in: productSizeIds } },
      include: { product: true },
    });

    if (productSizes.length !== productSizeIds.length) {
      return res.status(400).json({ error: 'Algún product_size_id no existe' });
    }

    let subtotal = 0;
    let totalWeight = 0;
    const psMap = {};
    for (const item of items) {
      const ps = productSizes.find(p => p.id === item.product_size_id);
      psMap[item.product_size_id] = ps;
      subtotal += ps.product.price * item.quantity;
      totalWeight += ps.weight * item.quantity;
    }

    // Llamada a la API de Correo Argentino para cálculo de envío
    const apiUrl = 'https://api.correoargentino.com.ar/shipping/cost'; // Cambia por tu URL real si difiere
    const payload = {
      serviceCode: shipping.external_service_code,
      peso: totalWeight,
      codigoPostal: address.postal_code,
    };

    const envioResponse = await axios.post(apiUrl, payload);
    
    // Validar estructura de respuesta y extraer costos
    if (
      !envioResponse.data ||
      !envioResponse.data.paqarClasico ||
      typeof envioResponse.data.paqarClasico.aSucursal !== 'number' ||
      typeof envioResponse.data.paqarClasico.aDomicilio !== 'number'
    ) {
      return res.status(502).json({ error: 'Respuesta inválida de la API de envío' });
    }

    const paqarSucursalCost = envioResponse.data.paqarClasico.aSucursal / 100; // centavos a pesos
    const paqarDomicilioCost = envioResponse.data.paqarClasico.aDomicilio / 100;

    // Total con envío a domicilio por defecto
    const total = subtotal + paqarDomicilioCost;

    // Crear orden
    const newOrder = await prisma.order.create({
      data: {
        user_id: userId,
        shipping_id,
        address_id,
        subtotal,
        shipping_cost: paqarDomicilioCost,
        paqar_sucursal_cost: paqarSucursalCost,
        paqar_domicilio_cost: paqarDomicilioCost,
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
            payment_method: 'pending',
            status: 'pending',
            amount: total,
          },
        },
      },
      include: {
        items: { include: { productSize: { include: { product: true } } } },
        shipping: true,
        address: true,
        payment: true,
      },
    });

    return res.status(201).json({
      message: 'Orden creada exitosamente',
      order: newOrder,
    });

  } catch (error) {
    console.error('Error al crear orden:', error);
    return res.status(500).json({ error: 'Error al crear orden' });
  }
};
// Obtener todas las órdenes
exports.getAllOrders = async (req, res) => {
  try {
    // Si querés que solo los admins vean todas las órdenes:
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Solo admins pueden ver todas las órdenes' });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: true,
        shipping: true,
        address: true,
        items: {
          include: {
            productSize: {
              include: {
                product: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener todas las órdenes:', error);
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
