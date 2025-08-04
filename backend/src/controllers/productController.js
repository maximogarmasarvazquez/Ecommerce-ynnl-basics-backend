const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un producto con tamaños (solo admin)
exports.createProduct = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admins pueden crear productos' });
  }

  try {
    const { name, description, price, image, category_id, sizes } = req.body;

    if (!name || !price || !category_id || !sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios o sizes inválidos' });
    }
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'Price debe ser un número positivo' });
    }
    // Validar categoría existe
    const categoryExists = await prisma.category.findUnique({ where: { id: category_id } });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category no encontrada' });
    }

    // Validar talles
    for (const s of sizes) {
      if (!s.size || typeof s.stock !== 'number' || s.stock < 0 || typeof s.weight !== 'number' || s.weight <= 0) {
        return res.status(400).json({ error: 'Sizes deben tener size, stock >= 0 y weight > 0' });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        category_id,
        sizes: {
          create: sizes.map(({ size, stock, weight }) => ({
            size,
            stock,
            weight,
          })),
        },
      },
      include: { sizes: true, category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error creando producto' });
  }
};

// Obtener producto por ID (público)
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true, category: true },
    });

    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(product);
  } catch (error) {
    console.error('Error buscando producto:', error);
    res.status(500).json({ error: 'Error buscando producto' });
  }
};

// Actualizar producto y tamaños (solo admin)
exports.updateProduct = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admins pueden actualizar productos' });
  }

  const { id } = req.params;
  const { name, description, price, image, category_id, sizes } = req.body;

  try {
    const productExists = await prisma.product.findUnique({ where: { id } });
    if (!productExists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Validar categoría si se quiere actualizar
    if (category_id) {
      const categoryExists = await prisma.category.findUnique({ where: { id: category_id } });
      if (!categoryExists) {
        return res.status(400).json({ error: 'Category no encontrada' });
      }
    }

    // Actualizar solo campos que vienen
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'Price debe ser un número positivo' });
      }
      updateData.price = price;
    }
    if (image !== undefined) updateData.image = image;
    if (category_id !== undefined) updateData.category_id = category_id;

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    if (sizes) {
      for (const s of sizes) {
        if (!s.size || typeof s.stock !== 'number' || s.stock < 0 || typeof s.weight !== 'number' || s.weight <= 0) {
          return res.status(400).json({ error: 'Sizes deben tener size, stock >= 0 y weight > 0' });
        }
      }

      // Transacción para evitar inconsistencias
      await prisma.$transaction([
        prisma.productSize.deleteMany({ where: { product_id: id } }),
        prisma.productSize.createMany({
          data: sizes.map(({ size, stock, weight }) => ({
            product_id: id,
            size,
            stock,
            weight,
          })),
        }),
      ]);
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true, category: true },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
};

// Eliminar producto (solo admin)
exports.deleteProduct = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admins pueden eliminar productos' });
  }

  const { id } = req.params;

  try {
    const productExists = await prisma.product.findUnique({ where: { id } });
    if (!productExists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error eliminando producto' });
  }
};

// Obtener todos los productos (público)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { sizes: true, category: true },
    });
    res.json(products);
  } catch (error) {
    console.error('Error listando productos:', error);
    res.status(500).json({ error: 'Error listando productos' });
  }
};
