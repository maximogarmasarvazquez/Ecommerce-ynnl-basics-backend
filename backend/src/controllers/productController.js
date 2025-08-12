const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo admins pueden crear productos' });
  }

  try {
    const { name, description, price, image, category_id, sizes } = req.body;

    // Validaciones básicas
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio y debe ser texto' });
    }
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (!category_id || typeof category_id !== 'string') {
      return res.status(400).json({ error: 'category_id es obligatorio' });
    }
    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ error: 'sizes debe ser un array con al menos un talle' });
    }

    // Validar categoría existe
    const categoryExists = await prisma.category.findUnique({ where: { id: category_id } });
    if (!categoryExists) {
      return res.status(400).json({ error: 'Categoría no encontrada' });
    }

    // Validar talles
    for (const s of sizes) {
      if (
        !s.size || typeof s.size !== 'string' || s.size.trim() === '' ||
        typeof s.stock !== 'number' || !Number.isInteger(s.stock) || s.stock < 0 ||
        typeof s.weight !== 'number' || s.weight <= 0
      ) {
        return res.status(400).json({ error: 'Cada talle debe tener size (texto), stock (int >=0) y weight (número >0)' });
      }
      // Opcional: podrías validar length, width, height si vienen
    }

    // Crear producto con talles completos
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        category_id,
        sizes: {
          create: sizes.map(({ size, stock, weight, length, width, height }) => ({
            size: size.trim(),
            stock,
            weight,
            length: length !== undefined ? length : null,
            width: width !== undefined ? width : null,
            height: height !== undefined ? height : null,
          })),
        },
      },
      include: {
        sizes: true,
        category: true,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creando producto:', error);
    return res.status(500).json({ error: 'Error interno creando producto' });
  }
};

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

    if (category_id) {
      const categoryExists = await prisma.category.findUnique({ where: { id: category_id } });
      if (!categoryExists) {
        return res.status(400).json({ error: 'Categoría no encontrada' });
      }
    }

    // Validar datos si vienen
    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
      return res.status(400).json({ error: 'El nombre debe ser texto no vacío' });
    }
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return res.status(400).json({ error: 'El precio debe ser un número positivo' });
    }
    if (sizes !== undefined) {
      if (!Array.isArray(sizes)) {
        return res.status(400).json({ error: 'sizes debe ser un array' });
      }
      for (const s of sizes) {
        if (
          !s.size || typeof s.size !== 'string' || s.size.trim() === '' ||
          typeof s.stock !== 'number' || !Number.isInteger(s.stock) || s.stock < 0 ||
          typeof s.weight !== 'number' || s.weight <= 0
        ) {
          return res.status(400).json({ error: 'Cada talle debe tener size (texto), stock (int >=0) y weight (número >0)' });
        }
      }
    }

    // Actualizar producto
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (image !== undefined) updateData.image = image;
    if (category_id !== undefined) updateData.category_id = category_id;

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Actualizar talles con dimensiones opcionales
    if (sizes !== undefined) {
      // Primero borrar talles actuales
      await prisma.productSize.deleteMany({ where: { product_id: id } });

      // Crear talles nuevos con dimensiones opcionales
      await Promise.all(
        sizes.map(({ size, stock, weight, length, width, height }) =>
          prisma.productSize.create({
            data: {
              product_id: id,
              size: size.trim(),
              stock,
              weight,
              length: length !== undefined ? length : null,
              width: width !== undefined ? width : null,
              height: height !== undefined ? height : null,
            },
          })
        )
      );
    }

    // Devolver producto actualizado con talles y categoría
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true, category: true },
    });

    return res.json(updatedProduct);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return res.status(500).json({ error: 'Error interno actualizando producto' });
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
