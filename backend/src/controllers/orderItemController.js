const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un OrderItem
exports.createOrderItem = async (req, res) => {
  try {
    const { order_id, product_size_id, quantity, price } = req.body;

    if (!order_id || !product_size_id || !quantity || !price) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const newOrderItem = await prisma.orderItem.create({
      data: {
        order_id,
        product_size_id,
        quantity,
        price,
      },
      include: {
        productSize: {
          include: { product: true }
        },
        order: true,
      },
    });

    res.status(201).json(newOrderItem);
  } catch (error) {
    console.error('Error al crear OrderItem:', error);
    res.status(500).json({ error: 'Error al crear OrderItem' });
  }
};

// Obtener un OrderItem por ID
exports.getOrderItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        productSize: {
          include: { product: true }
        },
        order: true,
      },
    });

    if (!orderItem) {
      return res.status(404).json({ error: 'OrderItem no encontrado' });
    }

    res.json(orderItem);
  } catch (error) {
    console.error('Error al obtener OrderItem:', error);
    res.status(500).json({ error: 'Error al obtener OrderItem' });
  }
};

// Actualizar un OrderItem (por ejemplo cantidad y precio)
exports.updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    const updatedOrderItem = await prisma.orderItem.update({
      where: { id },
      data: {
        quantity,
        price,
      },
      include: {
        productSize: {
          include: { product: true }
        },
        order: true,
      },
    });

    res.json(updatedOrderItem);
  } catch (error) {
    console.error('Error al actualizar OrderItem:', error);
    res.status(500).json({ error: 'Error al actualizar OrderItem' });
  }
};

// Eliminar un OrderItem
exports.deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.orderItem.delete({ where: { id } });

    res.json({ message: 'OrderItem eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar OrderItem:', error);
    res.status(500).json({ error: 'Error al eliminar OrderItem' });
  }
};

// Obtener todos los OrderItems de una orden
exports.getOrderItemsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderItems = await prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: {
        productSize: {
          include: { product: true }
        },
        order: true,
      },
    });

    res.json(orderItems);
  } catch (error) {
    console.error('Error al obtener OrderItems de la orden:', error);
    res.status(500).json({ error: 'Error al obtener OrderItems' });
  }
};
