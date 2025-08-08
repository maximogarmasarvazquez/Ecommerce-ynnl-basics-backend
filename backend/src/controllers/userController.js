
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const validRoles = ['client', 'admin'];

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'client',
      },
    });

    // 🛒 Si el rol es cliente, crear carrito solo si no existe
    if ((role || 'client') === 'client') {
      const existingCart = await prisma.cart.findUnique({
        where: { user_id: newUser.id },
      });

      if (!existingCart) {
        await prisma.cart.create({
          data: { user_id: newUser.id },
        });
      }
    }

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);

    // Validación especial si se intenta crear un carrito duplicado
    if (
      error.code === 'P2002' &&
      error.meta?.target?.includes('user_id')
    ) {
      return res.status(400).json({
        error: 'Este usuario ya tiene un carrito asignado.',
      });
    }

    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};



// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.user?.id;
  const tokenUserRole = req.user?.role;

  // Validar que el usuario sea admin o que esté accediendo a su propio perfil
  if (tokenUserRole !== 'admin' && tokenUserId !== id) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true, // No se incluye password
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('[ERROR getUserById]:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.user?.id;
  const tokenUserRole = req.user?.role;

  if (tokenUserRole !== 'admin' && String(tokenUserId) !== String(id)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('[ERROR getUserById]:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};


// Actualizar usuario
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const tokenUserId = req.user?.id;
  const tokenUserRole = req.user?.role;

  if (tokenUserRole !== 'admin' && String(tokenUserId) !== String(id)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const { name, email, password } = req.body;

  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (email) dataToUpdate.email = email;

  if (password && password.trim() !== '') {
    const bcrypt = require('bcryptjs');
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('[ERROR updateUser]:', error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Solo el admin o el mismo usuario puede eliminar
  if (userRole !== 'admin' && userId !== id) {
    return res.status(403).json({ error: 'Acceso denegado.' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al eliminar el usuario.' });
  }
};
