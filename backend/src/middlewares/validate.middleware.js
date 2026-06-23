const Joi = require('joi');

/**
 * Middleware para validar el cuerpo de la solicitud usando un esquema Joi.
 * 
 * Ejemplo de uso:
 * 
 * const Joi = require('joi');
 * const { validate } = require('../middlewares/validate.middleware');
 * 
 * const userSchema = Joi.object({
 *   name: Joi.string().required(),
 *   email: Joi.string().email().required(),
 * });
 * 
 * router.post('/users', validate(userSchema), (req, res) => {
 *   res.send('User validated!');
 * });
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

module.exports = { validate };