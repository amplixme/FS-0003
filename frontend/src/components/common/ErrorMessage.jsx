import styles from './ErrorMessage.module.css';


const ErrorMessage = ({ message = 'Ocurrió un error inesperado.', onRetry, retryLabel = 'Reintentar' }) => (
  <div className={styles.container} role="alert">
    <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
      error
    </span>
    <p className={styles.message}>{message}</p>
    {onRetry && (
      <button className={styles.retryBtn} onClick={onRetry} type="button">
        <span className={`material-symbols-outlined ${styles.retryIcon}`} aria-hidden="true">refresh</span>
        {retryLabel}
      </button>
    )}
  </div>
);

export default ErrorMessage;