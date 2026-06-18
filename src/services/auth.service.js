const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Simula la búsqueda de usuario por email.
 * Reemplazar con consulta real a Prisma u ORM cuando esté disponible.
 */
const findUserByEmail = async (email) => {
  // TODO: reemplazar con: return prisma.user.findUnique({ where: { email } });
  // Datos de prueba en memoria:
  const users = [
    {
      id: 1,
      email: 'admin@amplix.me',
      name: 'Admin Amplix',
      // bcrypt hash de "password123"
      password: '$2b$10$PEIHD.nckAvkaLoH.tfD7O1inGUx5AfXLH3JFMDvKB9Tj.2/b5EmC',
    },
  ];
  return users.find((u) => u.email === email) || null;
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

module.exports = { loginUser };