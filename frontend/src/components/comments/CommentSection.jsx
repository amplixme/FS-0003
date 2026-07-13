import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { create, getByPostId } from '../../services/comment.service';
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
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await create(postId, { content: trimmedContent });
      setContent('');
      const data = await getByPostId(postId);
      setComments(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setSubmitError(err.message || 'No se pudo enviar el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {isAuthenticated ? (
        <form className={styles.commentForm} onSubmit={handleSubmit}>
          <label className={styles.formLabel} htmlFor="comment-content">
            Escribe un comentario
          </label>
          <textarea
            id="comment-content"
            className={styles.textarea}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Comparte tu opinión…"
            rows={4}
            disabled={isSubmitting}
            required
          />
          {submitError && (
            <p className={styles.submitError} role="alert">{submitError}</p>
          )}
          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Comentando…' : 'Comentar'}
          </button>
        </form>
      ) : (
        <p className={styles.loginPrompt}>
          <Link to="/login">Inicia sesión</Link> para comentar
        </p>
      )}
    </section>
  );
}
