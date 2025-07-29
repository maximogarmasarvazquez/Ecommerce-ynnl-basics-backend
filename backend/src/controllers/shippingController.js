const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear nuevo método de envío
exports.createShipping = async (req, res) => {
  try {
    const { name, base_price, price_per_kilo, estimated_days } = req.body;

    const newShipping = await prisma.shipping.create({
      data: {
        name,
        base_price,
        price_per_kilo,
        estimated_days,
      },
    });

    res.status(201).json(newShipping);
  } catch (error) {
    console.error('Error al crear método de envío:', error);
    res.status(500).json({ message: 'Error al crear método de envío' });
  }
};

// Obtener todos los métodos de envío
exports.getAllShippings = async (req, res) => {
  try {
    const shippings = await prisma.shipping.findMany();
    res.status(200).json(shippings);
  } catch (error) {
    console.error('Error al obtener métodos de envío:', error);
    res.status(500).json({ message: 'Error al obtener métodos de envío' });
  }
};

// Obtener un método de envío por ID
exports.getShippingById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipping = await prisma.shipping.findUnique({
      where: { id },
    });

    if (!shipping) {
      return res.status(404).json({ message: 'Método de envío no encontrado' });
    }

    res.status(200).json(shipping);
  } catch (error) {
    console.error('Error al obtener el método de envío:', error);
    res.status(500).json({ message: 'Error al obtener el método de envío' });
  }
};

// Actualizar método de envío
exports.updateShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, base_price, price_per_kilo, estimated_days } = req.body;

    const updatedShipping = await prisma.shipping.update({
      where: { id },
      data: {
        name,
        base_price,
        price_per_kilo,
        estimated_days,
      },
    });

    res.status(200).json(updatedShipping);
  } catch (error) {
    console.error('Error al actualizar método de envío:', error);
    res.status(500).json({ message: 'Error al actualizar método de envío' });
  }
};

// Eliminar método de envío
exports.deleteShipping = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.shipping.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Método de envío eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar método de envío:', error);
    res.status(500).json({ message: 'Error al eliminar método de envío' });
  }
};
