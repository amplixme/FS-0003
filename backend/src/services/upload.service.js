const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Cloudinary se configura automáticamente vía CLOUDINARY_URL
cloudinary.config({
  url: process.env.CLOUDINARY_URL,
});

/**
 * Sube un archivo (buffer) a Cloudinary.
 *
 * @param {Buffer} buffer - Contenido del archivo
 * @param {string} originalname - Nombre original del archivo (para el public_id)
 * @returns {Promise<string>} URL segura de la imagen subida
 */
const uploadImage = async (buffer, originalname) => {
  const publicId = `${Date.now()}-${pathWithoutExt(originalname)}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'img-amplix-blog',
        public_id: publicId,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Error al subir a Cloudinary: ${error.message}`));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

/**
 * Elimina la extensión de un nombre de archivo y sanitiza para Cloudinary.
 */
const pathWithoutExt = (filename) => {
  const name = filename.replace(/\.[^.]+$/, ''); // saca extensión
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-zA-Z0-9_-]/g, '_') // sanitiza
    .slice(0, 80); // límite Cloudinary
};

module.exports = { uploadImage };
