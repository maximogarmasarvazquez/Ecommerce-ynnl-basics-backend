const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calcularPesoVolumetrico, calcularCostoEnvio } = require('../envioService');

// Crear nuevo método de envío
exports.createShipping = async (req, res) => {
  try {
    const {
      name,
      base_price,
      price_per_kilo,
      estimated_days,
      external_service_code,
      description,
      active = true,  // por defecto activo
    } = req.body;

    // Validá que los campos obligatorios estén presentes
    if (!name || base_price == null || price_per_kilo == null || estimated_days == null) {
      return res.status(400).json({ message: 'Faltan datos obligatorios para crear el método de envío' });
    }

    const newShipping = await prisma.shipping.create({
      data: {
        name,
        base_price,
        price_per_kilo,
        estimated_days,
        external_service_code,
        description,
        active,
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

exports.calculateShippingCost = async (req, res) => {
  try {
    const { items, postal_code, shipping_id, provinciaDestino } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'Debe enviar items para calcular el envío' });
    if (!shipping_id || !postal_code || !provinciaDestino)
      return res.status(400).json({ error: 'Faltan parámetros obligatorios' });

    const shipping = await prisma.shipping.findUnique({ where: { id: shipping_id } });
    if (!shipping) return res.status(400).json({ error: 'Método de envío inválido' });

    const cpOrigen = process.env.ORIGIN_CP || shipping.external_service_code || '5194';
    const provinciaOrigen = process.env.ORIGIN_PROV || 'AR-X';

    let totalWeight = 0;
    let maxPesoVol = 0;

    for (const item of items) {
      const productSize = await prisma.productSize.findUnique({
        where: { id: item.product_size_id }
      });
      if (!productSize) {
        return res.status(400).json({ error: `Product size no encontrado: ${item.product_size_id}` });
      }
      totalWeight += productSize.weight * item.quantity;

      if (productSize.length && productSize.width && productSize.height) {
        const pesoVol = await calcularPesoVolumetrico(productSize.length, productSize.width, productSize.height);
        if (pesoVol > maxPesoVol) maxPesoVol = pesoVol;
      }
    }

    const pesoFacturable = Math.max(totalWeight, maxPesoVol);

    console.log('Datos para calcularCostoEnvio:', { cpOrigen, cpDestino: postal_code, provinciaOrigen, provinciaDestino, peso: pesoFacturable });

    const costo = await calcularCostoEnvio({
      cpOrigen,
      cpDestino: postal_code,
      provinciaOrigen,
      provinciaDestino,
      peso: pesoFacturable,
    });

    res.json({
      estimated_cost: costo,
      estimated_days: shipping.estimated_days || 'Desconocido',
      total_weight: totalWeight,
      peso_volumetrico: maxPesoVol,
      peso_facturable: pesoFacturable,
    });

  } catch (error) {
    if (error.response) {
      console.error('API Response error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
