const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear
exports.createProductSize = async (req, res) => {
  try {
    const { size, stock, weight, productId } = req.body;

    if (!size || typeof size !== 'string' || size.trim() === '') {
      return res.status(400).json({ error: 'Size inválido' });
    }
    if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({ error: 'Stock debe ser entero >= 0' });
    }
    if (typeof weight !== 'number' || weight <= 0) {
      return res.status(400).json({ error: 'Weight debe ser número positivo' });
    }
    if (!productId) {
      return res.status(400).json({ error: 'productId es obligatorio' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(400).json({ error: 'Producto no encontrado' });
    }

    const newSize = await prisma.productSize.create({
      data: {
        size,
        stock,
        weight,
        product_id: productId,
      },
      include: { product: true },
    });

    res.status(201).json(newSize);
  } catch (error) {
    console.error('Error al crear tamaño de producto:', error);
    res.status(500).json({ error: 'Error al crear tamaño de producto' });
  }
};

// Obtener todos
exports.getAllProductSizes = async (req, res) => {
  try {
    const sizes = await prisma.productSize.findMany({
      include: { product: true },
    });
    res.json(sizes);
  } catch (error) {
    console.error('Error al obtener talles de productos:', error);
    res.status(500).json({ error: 'Error al obtener talles de productos' });
  }
};

// Obtener por ID
exports.getProductSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await prisma.productSize.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!size) return res.status(404).json({ error: 'Talle no encontrado' });
    res.json(size);
  } catch (error) {
    console.error('Error al obtener el talle:', error);
    res.status(500).json({ error: 'Error al obtener el talle' });
  }
};

// Actualizar
exports.updateProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, stock, weight } = req.body;

    const existing = await prisma.productSize.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Talle no encontrado' });

    const updateData = {};

    if (size !== undefined) {
      if (typeof size !== 'string' || size.trim() === '') {
        return res.status(400).json({ error: 'Size inválido' });
      }
      updateData.size = size;
    }

    if (stock !== undefined) {
      if (typeof stock !== 'number' || stock < 0 || !Number.isInteger(stock)) {
        return res.status(400).json({ error: 'Stock debe ser entero >= 0' });
      }
      updateData.stock = stock;
    }

    if (weight !== undefined) {
      if (typeof weight !== 'number' || weight <= 0) {
        return res.status(400).json({ error: 'Weight debe ser número positivo' });
      }
      updateData.weight = weight;
    }

    const updated = await prisma.productSize.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar el talle:', error);
    res.status(500).json({ error: 'Error al actualizar el talle' });
  }
};

// Eliminar
exports.deleteProductSize = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.productSize.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Talle no encontrado' });

    await prisma.productSize.delete({ where: { id } });
    res.json({ message: 'Talle eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el talle:', error);
    res.status(500).json({ error: 'Error al eliminar el talle' });
  }
};
