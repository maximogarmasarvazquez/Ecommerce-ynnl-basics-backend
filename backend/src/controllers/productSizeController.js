const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProductSize = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admins pueden crear talles' });
  }

  try {
    const { size, stock, weight, length, width, height, product_id } = req.body;

    // Validaciones básicas
    if (!size || typeof size !== 'string' || size.trim() === '') {
      return res.status(400).json({ error: 'El tamaño (size) es obligatorio y debe ser texto' });
    }
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: 'Stock debe ser un entero mayor o igual a 0' });
    }
    if (typeof weight !== 'number' || weight <= 0) {
      return res.status(400).json({ error: 'Weight debe ser número positivo' });
    }
    if (!product_id || typeof product_id !== 'string') {
      return res.status(400).json({ error: 'product_id es obligatorio' });
    }

    // Validar dimensiones opcionales
    if (length !== undefined && (typeof length !== 'number' || length <= 0)) {
      return res.status(400).json({ error: 'Length debe ser número positivo si se envía' });
    }
    if (width !== undefined && (typeof width !== 'number' || width <= 0)) {
      return res.status(400).json({ error: 'Width debe ser número positivo si se envía' });
    }
    if (height !== undefined && (typeof height !== 'number' || height <= 0)) {
      return res.status(400).json({ error: 'Height debe ser número positivo si se envía' });
    }

    // Validar que el producto exista
    const productExists = await prisma.product.findUnique({ where: { id: product_id } });
    if (!productExists) {
      return res.status(400).json({ error: 'Producto no encontrado' });
    }

    // Crear talle
    const newSize = await prisma.productSize.create({
      data: {
        size: size.trim(),
        stock,
        weight,
        length,
        width,
        height,
        product_id,
      },
    });

    res.status(201).json(newSize);
  } catch (error) {
    console.error('Error creando talle:', error);
    res.status(500).json({ error: 'Error interno creando talle' });
  }
};

// Obtener todos los talles con su producto
exports.getAllProductSizes = async (req, res) => {
  try {
    const sizes = await prisma.productSize.findMany({
      include: { product: true },
    });
    res.json(sizes);
  } catch (error) {
    console.error('Error al obtener talles:', error);
    res.status(500).json({ error: 'Error al obtener talles' });
  }
};

// Obtener talle por ID
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
    console.error('Error al obtener talle:', error);
    res.status(500).json({ error: 'Error al obtener talle' });
  }
};

// Actualizar talle
exports.updateProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, stock, weight, length, width, height } = req.body;

    const existing = await prisma.productSize.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Talle no encontrado' });

    const updateData = {};

    if (size !== undefined) {
      if (typeof size !== 'string' || size.trim() === '') {
        return res.status(400).json({ error: 'Size inválido' });
      }
      updateData.size = size.trim();
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
    if (length !== undefined) {
      if (typeof length !== 'number' || length <= 0) {
        return res.status(400).json({ error: 'Length debe ser número positivo' });
      }
      updateData.length = length;
    }
    if (width !== undefined) {
      if (typeof width !== 'number' || width <= 0) {
        return res.status(400).json({ error: 'Width debe ser número positivo' });
      }
      updateData.width = width;
    }
    if (height !== undefined) {
      if (typeof height !== 'number' || height <= 0) {
        return res.status(400).json({ error: 'Height debe ser número positivo' });
      }
      updateData.height = height;
    }

    const updated = await prisma.productSize.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar talle:', error);
    res.status(500).json({ error: 'Error al actualizar talle' });
  }
};

// Eliminar talle
exports.deleteProductSize = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.productSize.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Talle no encontrado' });

    await prisma.productSize.delete({ where: { id } });
    res.json({ message: 'Talle eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar talle:', error);
    res.status(500).json({ error: 'Error al eliminar talle' });
  }
};