const { registerUser, loginUser } = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser({ email, password, name });

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    return res.json(result);
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login };
