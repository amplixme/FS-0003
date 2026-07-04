import { Link } from "react-router-dom";
import styles from "./PostCard.module.css";

const EXCERPT_LENGTH = 150;
const MAX_VISIBLE_CATEGORIES = 3;
const CATEGORY_COLORS = [
  { background: "#dbeafe", border: "#bfdbfe", color: "#1d4ed8" },
  { background: "#dcfce7", border: "#bbf7d0", color: "#166534" },
  { background: "#fef3c7", border: "#fde68a", color: "#92400e" },
  { background: "#fce7f3", border: "#fbcfe8", color: "#be185d" },
  { background: "#ede9fe", border: "#ddd6fe", color: "#6d28d9" },
];

const getExcerpt = (content) => {
  const normalizedContent = String(content || "").replace(/\s+/g, " ").trim();

  if (normalizedContent.length <= EXCERPT_LENGTH) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, EXCERPT_LENGTH).trim()}...`;
};

const formatDate = (date) => {
  if (!date) {
    return "Fecha no disponible";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
};

const getCategoryColor = (category, index) => {
  const key = category.slug || category.name || String(index);
  const hash = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length];
};

const PostCard = ({ post, onCategorySelect }) => {
  const authorName = post.author?.name || post.authorName || "Autor desconocido";
  const publishedAt = post.publishedAt || post.createdAt;
  const categories = Array.isArray(post.categories)
    ? post.categories.filter((category) => category?.name || category?.slug)
    : [];
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCount = categories.length - visibleCategories.length;

  return (
    <article className={styles.card}>
      <Link className={styles.cardLink} to={`/posts/${post.id}`} aria-label={`Leer ${post.title}`} />

      {/* Cover image */}
      <div className={styles.imageWrapper}>
        {post.coverImage ? (
          <img
            className={styles.image}
            src={post.coverImage}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className="material-symbols-outlined" aria-hidden="true">image</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{post.title}</h2>
        {visibleCategories.length > 0 && (
          <div className={styles.categories} aria-label="Categorías del post">
            {visibleCategories.map((category, index) => {
              const color = getCategoryColor(category, index);
              const label = category.name || category.slug;

              return (
                <button
                  key={category.id || category.slug || label}
                  type="button"
                  className={styles.categoryBadge}
                  style={{
                    "--category-bg": color.background,
                    "--category-border": color.border,
                    "--category-color": color.color,
                  }}
                  onClick={() => category.slug && onCategorySelect?.(category.slug)}
                  disabled={!category.slug || !onCategorySelect}
                >
                  {label}
                </button>
              );
            })}
            {hiddenCount > 0 && <span className={styles.moreBadge}>+{hiddenCount}</span>}
          </div>
        )}
        <p className={styles.excerpt}>{getExcerpt(post.content)}</p>
        <div className={styles.meta}>
          <span>{authorName}</span>
          <time dateTime={publishedAt || undefined}>{formatDate(publishedAt)}</time>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
