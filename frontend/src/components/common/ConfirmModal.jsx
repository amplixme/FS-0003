import { useEffect } from "react";
import styles from "./ConfirmModal.module.css";

/**
 * ConfirmModal — componente reutilizable de confirmación.
 *
 * Props:
 *   isOpen      {boolean}  — controla visibilidad
 *   title       {string}   — título del modal
 *   message     {string}   — mensaje de confirmación
 *   confirmLabel {string}  — texto del botón confirmar (default: "Eliminar")
 *   cancelLabel  {string}  — texto del botón cancelar (default: "Cancelar")
 *   onConfirm   {function} — callback al confirmar
 *   onCancel    {function} — callback al cancelar
 *   isLoading   {boolean}  — deshabilita botones durante la operación
 *   danger      {boolean}  — botón confirmar en rojo (default: true)
 */
const ConfirmModal = ({
  isOpen,
  title = "¿Estás seguro?",
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
  danger = true,
}) => {
  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className={styles.modal}>
        {/* Ícono de advertencia */}
        <div className={styles.iconWrap}>
          <span className="material-symbols-outlined" aria-hidden="true">
            warning
          </span>
        </div>

        <h2 id="confirm-modal-title" className={styles.title}>
          {title}
        </h2>

        {message && (
          <p className={styles.message}>{message}</p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`${styles.confirmBtn} ${danger ? styles.confirmDanger : styles.confirmPrimary}`}
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Eliminando…
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;