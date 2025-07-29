const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear
exports.createProductSize = async (req, res) => {
  try {
    const { size, stock, weight, productId } = req.body;

    const newSize = await prisma.productSize.create({
      data: {
        size,
        stock,
        weight,
        product_id: productId,  // clave foránea correcta
      },
      include: {
        product: true,          // incluir info del producto relacionado
      },
    });

    res.status(201).json(newSize);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear tamaño de producto' });
  }
};
// Obtener todos
exports.getAllProductSizes = async (req, res) => {
  try {
    const sizes = await prisma.productSize.findMany();
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener talles de productos' });
  }
};

// Obtener por ID
exports.getProductSizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const size = await prisma.productSize.findUnique({ where: { id } });
    if (!size) return res.status(404).json({ error: 'Talle no encontrado' });
    res.json(size);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el talle' });
  }
};

// Actualizar
exports.updateProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { size, stock, weight } = req.body;
    const updated = await prisma.productSize.update({
      where: { id },
      data: { size, stock, weight },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el talle' });
  }
};

// Eliminar
exports.deleteProductSize = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.productSize.delete({ where: { id } });
    res.json({ message: 'Talle eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el talle' });
  }
};
