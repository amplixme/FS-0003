/**
 * Middleware global de manejo de errores.
 * Debe registrarse como el ÚLTIMO middleware en app.js.
 */

const PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: 'Conflict: el recurso ya existe.' },
  P2025: { status: 404, message: 'Not Found: el recurso no fue encontrado.' },
};

/**
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ErrorHandler] ${err.message}`, err.stack);

  // Errores de Prisma (ClientKnownRequestError tienen la prop `code`)
  if (err.code && PRISMA_ERROR_MAP[err.code]) {
    const { status, message } = PRISMA_ERROR_MAP[err.code];
    return res.status(status).json({
      error: { message, status },
    });
  }

  // Errores con status explícito (lanzados manualmente con err.status)
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(status).json({
    error: { message, status },
  });
};

module.exports = { errorHandler };