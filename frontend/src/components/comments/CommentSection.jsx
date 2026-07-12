import { useState, useEffect } from 'react';
import { getByPostId } from '../../services/comment.service';
import { Spinner } from '../common';
import styles from './CommentSection.module.css';

const formatRelativeDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffMs = Date.now() - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1)    return 'Hace un momento';
  if (diffMins < 60)   return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24)  return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7)    return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  if (diffWeeks < 5)   return `Hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
  if (diffMonths < 12) return `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
  return `Hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
};

const CommentItem = ({ comment }) => (
  <div className={styles.commentItem}>
    <div className={styles.commentAvatar}>
      {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
    <div className={styles.commentBody}>
      <div className={styles.commentMeta}>
        <span className={styles.commentAuthor}>{comment.author?.name || 'Usuario'}</span>
        <span className={styles.commentDate}>{formatRelativeDate(comment.createdAt)}</span>
      </div>
      <p className={styles.commentContent}>{comment.content}</p>
    </div>
  </div>
);

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getByPostId(postId);
        if (!cancelled) setComments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'No se pudieron cargar los comentarios');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchComments();
    return () => { cancelled = true; };
  }, [postId]);

  return (
    <section className={styles.section} aria-label="Comentarios">
      <h2 className={styles.title}>
        <span className="material-symbols-outlined" aria-hidden="true">comment</span>
        Comentarios
        {!loading && !error && (
          <span className={styles.count}>{comments.length}</span>
        )}
      </h2>

      {loading && (
        <div className={styles.spinnerWrapper}>
          <Spinner size="md" label="Cargando comentarios…" />
        </div>
      )}

      {!loading && error && (
        <p className={styles.errorMsg}>
          <span className="material-symbols-outlined" aria-hidden="true">error_outline</span>
          {error}
        </p>
      )}

      {!loading && !error && comments.length === 0 && (
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined" aria-hidden="true">chat_bubble_outline</span>
          <p>Aún no hay comentarios. ¡Sé el primero!</p>
        </div>
      )}

      {!loading && !error && comments.length > 0 && (
        <ul className={styles.commentList}>
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}