const { uploadImage } = require('../services/upload.service');

/**
 * POST /api/upload
 * Sube una imagen a Cloudinary.
 * Requiere: authMiddleware, upload.single('image')
 */
const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('No se envió ningún archivo.');
      err.status = 400;
      throw err;
    }

    const url = await uploadImage(req.file.buffer, req.file.originalname);

    return res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
};

module.exports = { upload };
