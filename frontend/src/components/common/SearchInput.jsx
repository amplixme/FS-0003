import { useEffect, useRef, useState } from 'react';
import styles from './SearchInput.module.css';

const SearchInput = ({ value = '', onSearch, debounceMs = 300 }) => {
  const [query, setQuery] = useState(value);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery === value) return undefined;

    const timeoutId = setTimeout(() => {
      onSearchRef.current(normalizedQuery);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [debounceMs, query, value]);

  const clearSearch = () => {
    setQuery('');
    onSearchRef.current('');
  };

  return (
    <div className={styles.search} role="search">
      <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
        search
      </span>
      <label className="visually-hidden" htmlFor="post-search">
        Buscar publicaciones
      </label>
      <input
        id="post-search"
        type="search"
        className={styles.input}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar publicaciones..."
        aria-label="Buscar publicaciones"
        autoComplete="off"
      />
      {query && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={clearSearch}
          aria-label="Limpiar búsqueda"
        >
          X
        </button>
      )}
    </div>
  );
};

export default SearchInput;
