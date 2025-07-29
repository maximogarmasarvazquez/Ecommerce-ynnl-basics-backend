const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear categoría
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando categoría' });
  }
};

// Obtener todas las categorías
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo categorías' });
  }
};

// Obtener categoría por ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error buscando categoría' });
  }
};

// Actualizar categoría
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name },
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error actualizando categoría' });
  }
};

// Eliminar categoría
exports.deleteCategory = async (req, res) => {
      const { id } = req.params;
 try {
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'categoria eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error eliminando categoria' });
  }
};
