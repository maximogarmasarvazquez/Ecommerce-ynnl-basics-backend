const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Crear una nueva dirección (cualquier usuario autenticado)
exports.createAddress = async (req, res) => {
  const userId = req.user.id;
  const {
    street,
    city,
    state,
    country,
    postal_code,
    phone,
    is_default = false,
  } = req.body;

  try {
    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        user_id: userId,
        street,
        city,
        state,
        country,
        postal_code,
        phone,
        is_default,
      },
    });

    res.status(201).json(newAddress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear dirección' });
  }
};

// Obtener todas las direcciones del usuario (solo propias)
exports.getUserAddresses = async (req, res) => {
  const userId = req.user.id;

  try {
    const addresses = await prisma.address.findMany({
      where: { user_id: userId },
      orderBy: { is_default: 'desc' },
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
};

// Editar una dirección (dueño o admin)
exports.updateAddress = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const {
    street,
    city,
    state,
    country,
    postal_code,
    phone,
    is_default,
  } = req.body;

  try {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    const isOwner = address.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta dirección' });
    }

    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: address.user_id },
        data: { is_default: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        street,
        city,
        state,
        country,
        postal_code,
        phone,
        is_default,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar dirección:', err);
    res.status(500).json({ error: 'Error al actualizar dirección' });
  }
};

// Eliminar una dirección (dueño o admin)
exports.deleteAddress = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    const isOwner = address.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta dirección' });
    }

    await prisma.address.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    console.error('Error al eliminar dirección:', err);
    res.status(500).json({ error: 'Error al eliminar dirección' });
  }
};

// Marcar una dirección como predeterminada (dueño o admin)
exports.setDefaultAddress = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  try {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    const isOwner = address.user_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta dirección' });
    }

    await prisma.address.updateMany({
      where: { user_id: address.user_id },
      data: { is_default: false },
    });

    await prisma.address.update({
      where: { id },
      data: { is_default: true },
    });

    res.json({ message: 'Dirección predeterminada actualizada' });
  } catch (err) {
    console.error('Error al marcar dirección predeterminada:', err);
    res.status(500).json({ error: 'Error al marcar dirección predeterminada' });
  }
};
