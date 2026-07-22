import { useEffect, useId, useRef } from "react";
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
  const modalRef = useRef(null);
  const previouslyFocusedElement = useRef(null);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElement.current = document.activeElement;
    modalRef.current?.focus();

    return () => previouslyFocusedElement.current?.focus?.();
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel?.();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
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
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        tabIndex={-1}
      >
        {/* Ícono de advertencia */}
        <div className={styles.iconWrap}>
          <span className="material-symbols-outlined" aria-hidden="true">
            warning
          </span>
        </div>

        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>

        {message && (
          <p id={messageId} className={styles.message}>{message}</p>
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
