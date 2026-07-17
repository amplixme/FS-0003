import styles from "./Pagination.module.css";

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((page, index) => {
    const previousPage = pages[index - 1];
    return previousPage && page - previousPage > 1 ? ["ellipsis", page] : [page];
  });
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageCount = Math.max(0, Math.trunc(Number(totalPages) || 0));
  const activePage = Math.min(
    pageCount,
    Math.max(1, Math.trunc(Number(currentPage) || 1)),
  );

  if (pageCount <= 1) return null;

  const pageItems = getPageItems(activePage, pageCount);

  return (
    <nav className={styles.pagination} aria-label="Paginación de publicaciones">
      <button
        type="button"
        className={`${styles.button} ${styles.direction}`}
        onClick={() => onPageChange(activePage - 1)}
        disabled={activePage === 1}
        aria-label="Página anterior"
      >
        <span aria-hidden="true">&lsaquo;</span>
        <span className={styles.directionLabel}>Anterior</span>
      </button>

      {pageItems.map((item, index) => (
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className={styles.ellipsis}
            aria-hidden="true"
          >
            &hellip;
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`${styles.button} ${item === activePage ? styles.active : ""} ${
              item === 1
              || item === pageCount
              || Math.abs(item - activePage) <= 1
                ? ""
                : styles.compactHidden
            }`}
            onClick={() => onPageChange(item)}
            aria-label={`Ir a la página ${item}`}
            aria-current={item === activePage ? "page" : undefined}
          >
            {item}
          </button>
        )
      ))}

      <button
        type="button"
        className={`${styles.button} ${styles.direction}`}
        onClick={() => onPageChange(activePage + 1)}
        disabled={activePage === pageCount}
        aria-label="Página siguiente"
      >
        <span className={styles.directionLabel}>Siguiente</span>
        <span aria-hidden="true">&rsaquo;</span>
      </button>
    </nav>
  );
};

export default Pagination;
