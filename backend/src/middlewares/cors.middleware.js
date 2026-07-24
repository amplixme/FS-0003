/**
 * Middleware de configuración de CORS.
 *
 * Modo desarrollo (sin CORS_ORIGIN):
 *   Permite localhost en cualquier puerto.
 *
 * Modo producción (con CORS_ORIGIN):
 *   Solo permite los orígenes explicitados en la variable de entorno.
 *   Múltiples orígenes separados por coma:
 *     CORS_ORIGIN=https://frontend.com,https://staging.com
 */

const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sin origen (server-to-server, Postman, curl, etc.)
    if (!origin) return callback(null, true);

    const corsOrigin = process.env.CORS_ORIGIN;

    // Sin CORS_ORIGIN → modo desarrollo
    if (!corsOrigin) {
      const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }

    // Con CORS_ORIGIN → modo producción
    const allowedOrigins = corsOrigin.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
};

module.exports = cors(corsOptions);
