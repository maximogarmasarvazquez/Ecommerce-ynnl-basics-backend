const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

// Crear pago
exports.createPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { order_id, payment_method, status, amount, transaction_id } = req.body;

    // Validar que la orden exista
    const order = await prisma.order.findUnique({ where: { id: order_id } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    // Opcional: podrías validar aquí que 'status' esté dentro de estados permitidos (ej: 'pending', 'approved', 'rejected')

    const payment = await prisma.payment.create({
      data: {
        order_id,
        payment_method,
        status,
        amount,
        transaction_id,
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creando pago:', error);
    res.status(500).json({ error: 'Error al crear pago' });
  }
};

// Obtener pago por ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(payment);
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({ error: 'Error al obtener pago' });
  }
};

// Actualizar pago (status, amount, transaction_id)
exports.updatePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { status, amount, transaction_id } = req.body;

    // Opcional: validar status permitido

    const payment = await prisma.payment.update({
      where: { id },
      data: { status, amount, transaction_id },
    });

    res.json(payment);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Pago no encontrado para actualizar' });
    }
    console.error('Error actualizando pago:', error);
    res.status(500).json({ error: 'Error al actualizar pago' });
  }
};

// Eliminar pago
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({ where: { id } });
    res.json({ message: 'Pago eliminado correctamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Pago no encontrado para eliminar' });
    }
    console.error('Error eliminando pago:', error);
    res.status(500).json({ error: 'Error al eliminar pago' });
  }
};

// Listar pagos (opcional: filtrar por orden)
exports.getAllPayments = async (req, res) => {
  try {
    const { order_id } = req.query;
    const whereClause = order_id ? { order_id } : {};

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: { order: true },
    });

    res.json(payments);
  } catch (error) {
    console.error('Error listando pagos:', error);
    res.status(500).json({ error: 'Error al listar pagos' });
  }
};
