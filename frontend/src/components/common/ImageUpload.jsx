import { useRef, useState, useCallback, useId } from 'react';
import api from '../../services/api';
import styles from './ImageUpload.module.css';

/**
 * ImageUpload — componente reutilizable de subida de imagen.
 *
 * Props:
 *   onUpload     {function(url: string)} — callback con la URL de Cloudinary al completar
 *   onClear      {function()}            — callback cuando se elimina la imagen
 *   initialUrl   {string}               — URL preexistente (modo edición)
 *   disabled     {boolean}              — deshabilita toda interacción
 *   label        {string}               — etiqueta visible sobre el componente
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ImageUpload = ({
  onUpload,
  onClear,
  initialUrl = null,
  disabled = false,
  label = 'Imagen de portada',
}) => {
  const inputRef = useRef(null);
  const inputId = useId();

  const [preview, setPreview]     = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // ─── Validación client-side ───────────────────────────────────────────────
  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten imágenes JPG, PNG o WebP.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'El archivo supera el tamaño máximo de 5 MB.';
    }
    return null;
  };

  // ─── Subida con seguimiento de progreso (XMLHttpRequest) ─────────────────
  const uploadFile = useCallback(
    async (file) => {
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Preview local inmediato
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setError(null);
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('image', file);

      try {
        const token = localStorage.getItem('token');

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                onUpload?.(data.url);
                resolve(data);
              } catch {
                reject(new Error('Respuesta inválida del servidor.'));
              }
            } else {
              try {
                const data = JSON.parse(xhr.responseText);
                reject(new Error(data.error?.message || 'Error al subir la imagen.'));
              } catch {
                reject(new Error('Error al subir la imagen.'));
              }
            }
          });

          xhr.addEventListener('error', () =>
            reject(new Error('Error de red al subir la imagen.'))
          );
          xhr.addEventListener('abort', () =>
            reject(new Error('Subida cancelada.'))
          );

          xhr.open('POST', `${import.meta.env.VITE_API_URL}/upload`);
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.send(formData);
        });
      } catch (err) {
        setError(err.message);
        // Revertir preview si falló
        setPreview(initialUrl);
        URL.revokeObjectURL(objectUrl);
      } finally {
        setUploading(false);
      }
    },
    [initialUrl, onUpload]
  );

  // ─── Handlers de input / drag & drop ─────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  };

  const handleDragOver  = (e) => { e.preventDefault(); if (!disabled && !uploading) setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleZoneClick = () => { if (!disabled && !uploading) inputRef.current?.click(); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoneClick(); }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setError(null);
    setProgress(0);
    onClear?.();
  };

  // ─── Clases dinámicas ─────────────────────────────────────────────────────
  const zoneClass = [
    styles.dropZone,
    isDragOver  && styles.dragOver,
    uploading   && styles.uploading,
    disabled    && styles.disabled,
    preview     && styles.hasPreview,
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}

      <div
        className={zoneClass}
        onClick={handleZoneClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zona de carga de imagen. Haz clic o arrastra una imagen aquí."
        aria-disabled={disabled || uploading}
        aria-busy={uploading}
      >
        {/* Input oculto */}
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          tabIndex={-1}
        />

        {preview ? (
          // ── Estado: imagen seleccionada ──────────────────────────────────
          <div className={styles.previewWrapper}>
            <img
              src={preview}
              alt="Vista previa de la imagen seleccionada"
              className={styles.previewImg}
            />

            {/* Botón eliminar */}
            {!uploading && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClear}
                aria-label="Eliminar imagen seleccionada"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            )}

            {/* Overlay de progreso */}
            {uploading && (
              <div className={styles.progressOverlay} aria-hidden="true">
                <div className={styles.progressBarWrap}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={styles.progressLabel}>{progress}%</span>
              </div>
            )}
          </div>
        ) : (
          // ── Estado: vacío (placeholder) ──────────────────────────────────
          <div className={styles.placeholder}>
            <span
              className={`material-symbols-outlined ${styles.uploadIcon}`}
              aria-hidden="true"
            >
              {isDragOver ? 'file_download' : 'add_photo_alternate'}
            </span>
            <p className={styles.placeholderText}>
              {isDragOver
                ? 'Suelta la imagen aquí'
                : 'Arrastra una imagen o haz clic para seleccionar'}
            </p>
            <p className={styles.placeholderHint}>JPG, PNG o WebP · máx. 5 MB</p>
          </div>
        )}
      </div>

      {/* Barra de progreso accesible para lectores de pantalla */}
      {uploading && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de subida"
          className={styles.srOnly}
        >
          {progress}%
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <p className={styles.errorMsg} role="alert">
          <span className="material-symbols-outlined" aria-hidden="true">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
