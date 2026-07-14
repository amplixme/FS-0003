import styles from './Pagination.module.css';

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'end-ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, 'start-ellipsis', ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  }

  return [1, 'start-ellipsis', currentPage - 1, currentPage, currentPage + 1, 'end-ellipsis', totalPages];
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const page = Math.min(Math.max(currentPage, 1), totalPages);

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <div className={styles.pages}>
        {getPageItems(page, totalPages).map((item) => (
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              className={`${styles.button} ${item === page ? styles.active : ''}`}
              onClick={() => onPageChange(item)}
              aria-label={`Ir a la página ${item}`}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </button>
          ) : (
            <span key={item} className={styles.ellipsis} aria-hidden="true">…</span>
          )
        ))}
      </div>

      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </nav>
  );
};

export default Pagination;
