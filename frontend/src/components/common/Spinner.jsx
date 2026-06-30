import styles from './Spinner.module.css';


const Spinner = ({ size = 'md', label = 'Cargando…' }) => (
  <div className={styles.wrapper} role="status" aria-label={label}>
    <span className={`${styles.circle} ${styles[size]}`} aria-hidden="true" />
    <span className={styles.srOnly}>{label}</span>
  </div>
);

export default Spinner;