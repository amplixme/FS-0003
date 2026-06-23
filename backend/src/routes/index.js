const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
router.use('/auth', authRoutes);

// ──────────────────────────────────────────────
// Cómo agregar una nueva ruta:
//
// 1. Crear el archivo de rutas (ej: post.routes.js)
// 2. Importarlo acá:
//    const postRoutes = require('./post.routes');
// 3. Montarlo con su prefijo:
//    router.use('/posts', postRoutes);
//
// La ruta quedará disponible en /api/posts
// ──────────────────────────────────────────────

module.exports = router;
