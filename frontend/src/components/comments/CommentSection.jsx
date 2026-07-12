import { useState, useEffect } from 'react';
import { getByPostId } from '../../services/comment.service';
import formatRelativeTime from '../../utils/formatRelativeTime';
import { Spinner } from '../common';
import styles from './CommentSection.module.css';

const CommentItem = ({ comment }) => (
  <div className={styles.commentItem}>
    <div className={styles.commentAvatar}>
      {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
    <div className={styles.commentBody}>
      <div className={styles.commentMeta}>
        <span className={styles.commentAuthor}>{comment.author?.name || 'Usuario'}</span>
        <span className={styles.commentDate}>{formatRelativeTime(comment.createdAt)}</span>
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