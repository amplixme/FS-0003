import { Link } from "react-router-dom";
import styles from "./PostCard.module.css";

const EXCERPT_LENGTH = 150;

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

const PostCard = ({ post }) => {
  const authorName = post.author?.name || post.authorName || "Autor desconocido";
  const publishedAt = post.publishedAt || post.createdAt;

  return (
    <Link className={styles.card} to={`/posts/${post.id}`}>
      <article className={styles.content}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.excerpt}>{getExcerpt(post.content)}</p>
        <div className={styles.meta}>
          <span>{authorName}</span>
          <time dateTime={publishedAt || undefined}>{formatDate(publishedAt)}</time>
        </div>
      </article>
    </Link>
  );
};

export default PostCard;
