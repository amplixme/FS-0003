const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Simula la búsqueda de usuario por email.
 * Reemplazar con consulta real a Prisma u ORM cuando esté disponible.
 */
const findUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
  
};

/**
 * Autentica al usuario y retorna token JWT + datos del usuario.
 * @param {string} email
 * @param {string} password
 * @returns {{ token: string, user: { id, email, name } }}
 */
const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);

  // Siempre comparamos con bcrypt para evitar timing attacks,
  // incluso cuando el usuario no existe (comparamos contra un hash dummy).
  const dummyHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const hashToCompare = user ? user.password : dummyHash;
  const isValid = await bcrypt.compare(password, hashToCompare);

  // No revelamos si el email o la contraseña son incorrectos
  if (!user || !isValid) {
    const err = new Error('Credenciales inválidas');
    err.status = 401;
    throw err;
  }

  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
};

/**
 * Registra un nuevo usuario con contraseña hasheada.
 * @param {{ email: string, password: string, name: string }} credentials
 * @returns {{ message: string }}
 */
const registerUser = async ({ email, password, name }) => {
  // Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  // Hashear contraseña con bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear usuario en la base de datos
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  return { message: 'Usuario registrado exitosamente' };
};

module.exports = { loginUser, registerUser };