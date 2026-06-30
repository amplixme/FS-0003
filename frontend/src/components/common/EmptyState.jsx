import styles from './EmptyState.module.css';

const EmptyState = ({ icon = 'inbox', message = 'No hay publicaciones todavía', actionLabel, onAction }) => (
  <div className={styles.container}>
    <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
      {icon}
    </span>
    <p className={styles.message}>{message}</p>
    {actionLabel && onAction && (
      <button className={styles.actionBtn} onClick={onAction} type="button">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;