const { loginUser, registerUser } = require('../services/auth.service');
const { success } = require('../utils/response');

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email y contraseña son requeridos');
      err.status = 400;
      throw err;
    }

    const result = await loginUser(email, password);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register };
