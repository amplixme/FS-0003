const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET;

const buildTokenPayload = (user) => ({
  userId: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role
});

const registerUser = async ({ email, password, name }) => {
  if (!JWT_SECRET) {
    const err = new Error('JWT_SECRET no configurado');
    err.status = 500;
    throw err;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const err = new Error('Email ya registrado');
    err.status = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'USER'
    }
  });

  const payload = buildTokenPayload(user);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  return { token, user: sanitizeUser(user) };
};

const loginUser = async (email, password) => {
  if (!JWT_SECRET) {
    const err = new Error('JWT_SECRET no configurado');
    err.status = 500;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const dummyHash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const hashToCompare = user ? user.password : dummyHash;
  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!user || !isValid) {
    const err = new Error('Credenciales invalidas');
    err.status = 401;
    throw err;
  }

  const payload = buildTokenPayload(user);
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  return { token, user: sanitizeUser(user) };
};

module.exports = { registerUser, loginUser };
