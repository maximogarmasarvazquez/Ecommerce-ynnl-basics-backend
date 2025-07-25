const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear un producto con sus tamaños
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category_id, sizes } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image,
        category_id,
        sizes: {
          create: sizes || [],
        },
      },
      include: { sizes: true, category: true },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando producto' });
  }
};

// Buscar producto por ID
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
    console.error(error);
    res.status(500).json({ error: 'Error buscando producto' });
  }
};

// Actualizar producto y tamaños
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category_id, sizes } = req.body;

  try {
    // Actualizar datos del producto
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        image,
        category_id,
      },
    });

    // Actualizar tamaños: eliminar antiguos y crear nuevos
    if (sizes) {
      await prisma.productSize.deleteMany({ where: { product_id: id } });
      await prisma.productSize.createMany({
        data: sizes.map(({ size, stock }) => ({
          size,
          stock,
          product_id: id,
        })),
      });
    }

    // Traer producto actualizado con relaciones
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { sizes: true, category: true },
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando producto' });
  }
};

// Eliminar producto por ID
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando producto' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
const products = await prisma.product.findMany(
//{include: { sizes: true, category: true },} // comentar si no hay datos o no está listo

);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error listando productos' });
  }
};
