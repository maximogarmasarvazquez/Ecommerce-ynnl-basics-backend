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

// NUEVO: Calcular costo estimado de envío
exports.calculateShippingCost = async (req, res) => {
  try {
    const { items, postal_code } = req.body; 
    // items: [{ product_size_id, quantity }, ...]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Debe enviar items para calcular el envío' });
    }

    // Calcular peso total
    let totalWeight = 0;
    for (const item of items) {
      const productSize = await prisma.productSize.findUnique({
        where: { id: item.product_size_id }
      });
      if (!productSize) {
        return res.status(400).json({ error: `Product size no encontrado: ${item.product_size_id}` });
      }
      totalWeight += productSize.weight * item.quantity;
    }

    // Obtener método de envío para calcular costo (aquí podés mejorar según postal_code)
    const shippingOption = await prisma.shipping.findFirst();

    if (!shippingOption) {
      return res.status(500).json({ error: 'No hay opciones de envío configuradas' });
    }

    // Calcular costo
    const cost = shippingOption.base_price + shippingOption.price_per_kilo * totalWeight;

    res.json({
      estimated_cost: cost,
      estimated_days: shippingOption.estimated_days,
      total_weight: totalWeight
    });

  } catch (error) {
    console.error('Error calculando costo de envío:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
