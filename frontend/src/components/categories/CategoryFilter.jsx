import { useEffect, useState } from 'react';
import { getAll } from '../../services/category.service';
import styles from './CategoryFilter.module.css';

const CategoryFilter = ({ activeSlug, onChange }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getAll()
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data?.categories) {
          setCategories(data.categories);
        } else if (data?.data) {
          setCategories(data.data);
        } else {
          setCategories([]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Desktop: sidebar */}
      <aside className={styles.sidebar}>
        <p className={styles.sidebarLabel}>Categorías</p>
        <ul className={styles.list}>
          <li>
            <button
              className={`${styles.item} ${!activeSlug ? styles.active : ''}`}
              onClick={() => onChange(null)}
            >
              Todas
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                className={`${styles.item} ${activeSlug === cat.slug ? styles.active : ''}`}
                onClick={() => onChange(cat.slug)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile: chips horizontales */}
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${!activeSlug ? styles.active : ''}`}
          onClick={() => onChange(null)}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.chip} ${activeSlug === cat.slug ? styles.active : ''}`}
            onClick={() => onChange(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </>
  );
};

export default CategoryFilter;
