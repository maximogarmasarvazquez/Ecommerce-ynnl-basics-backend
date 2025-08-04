const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaultInclude = {
  productSize: { include: { product: true } },
  order: true,
};

exports.createOrderItem = async (req, res) => {
  try {
    const { order_id, product_size_id, quantity, price } = req.body;

    if (!order_id || !product_size_id || !quantity || !price) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'quantity debe ser un número mayor o igual a 1' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price debe ser un número positivo' });
    }

    const productSize = await prisma.productSize.findUnique({
      where: { id: product_size_id },
    });
    if (!productSize) {
      return res.status(404).json({ error: 'ProductSize no encontrado' });
    }

    const product_id = productSize.product_id;

    const newOrderItem = await prisma.orderItem.create({
      data: {
        quantity,
        price,
        order: { connect: { id: order_id } },
        productSize: { connect: { id: product_size_id } },
        product: { connect: { id: product_id } },
      },
      include: defaultInclude,
    });

    res.status(201).json(newOrderItem);
  } catch (error) {
    console.error('Error al crear OrderItem:', error);
    res.status(500).json({ error: 'Error al crear OrderItem' });
  }
};

exports.getOrderItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderItem = await prisma.orderItem.findUnique({
      where: { id },
      include: defaultInclude,
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

exports.updateOrderItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'quantity debe ser un número mayor o igual a 1' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price debe ser un número positivo' });
    }

    const item = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!item) return res.status(404).json({ error: 'OrderItem no encontrado' });
    if (item.order.payment?.status === 'approved') {
      return res.status(403).json({ error: 'No se puede modificar un ítem de una orden ya pagada' });
    }

    const updatedOrderItem = await prisma.orderItem.update({
      where: { id },
      data: { quantity, price },
      include: defaultInclude,
    });

    res.json(updatedOrderItem);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'OrderItem no encontrado para actualizar' });
    }
    console.error('Error al actualizar OrderItem:', error);
    res.status(500).json({ error: 'Error al actualizar OrderItem' });
  }
};

exports.deleteOrderItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!item) return res.status(404).json({ error: 'OrderItem no encontrado' });
    if (item.order.payment?.status === 'approved') {
      return res.status(403).json({ error: 'No se puede eliminar un ítem de una orden ya pagada' });
    }

    await prisma.orderItem.delete({ where: { id } });

    res.json({ message: 'OrderItem eliminado correctamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'OrderItem no encontrado para eliminar' });
    }
    console.error('Error al eliminar OrderItem:', error);
    res.status(500).json({ error: 'Error al eliminar OrderItem' });
  }
};

exports.getOrderItemsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderItems = await prisma.orderItem.findMany({
      where: { order_id: orderId },
      include: defaultInclude,
    });

    res.json(orderItems);
  } catch (error) {
    console.error('Error al obtener OrderItems de la orden:', error);
    res.status(500).json({ error: 'Error al obtener OrderItems' });
  }
};
