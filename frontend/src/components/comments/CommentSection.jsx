import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  create,
  deleteComment,
  getByPostId,
  update as updateComment,
} from '../../services/comment.service';
import formatRelativeTime from '../../utils/formatRelativeTime';
import { ConfirmModal, Spinner } from '../common';
import styles from './CommentSection.module.css';

const CommentItem = ({
  comment,
  isOwn,
  isEditing,
  editContent,
  editError,
  isSaving,
  onStartEdit,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) => (
  <div className={styles.commentItem}>
    <div className={styles.commentAvatar}>
      {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
    <div className={styles.commentBody}>
      <div className={styles.commentMeta}>
        <span className={styles.commentAuthor}>{comment.author?.name || 'Usuario'}</span>
        <span className={styles.commentDate}>{formatRelativeTime(comment.createdAt)}</span>
      </div>
      {isEditing ? (
        <form className={styles.editForm} onSubmit={onSaveEdit}>
          <label className="visually-hidden" htmlFor={`edit-comment-${comment.id}`}>
            Editar comentario
          </label>
          <textarea
            id={`edit-comment-${comment.id}`}
            className={`${styles.textarea} ${styles.editTextarea}`}
            value={editContent}
            onChange={(event) => onEditContentChange(event.target.value)}
            aria-label="Editar comentario"
            rows={3}
            disabled={isSaving}
            required
          />
          {editError && (
            <p className={styles.submitError} role="alert">
              {editError}
            </p>
          )}
          <div className={styles.editActions}>
            <button
              className={styles.saveButton}
              type="submit"
              disabled={isSaving || !editContent.trim()}
            >
              {isSaving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onCancelEdit}
              disabled={isSaving}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className={styles.commentContent}>{comment.content}</p>
          {isOwn && (
            <div className={styles.commentActions}>
              <button className={styles.actionButton} type="button" onClick={onStartEdit}>
                Editar
              </button>
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                type="button"
                onClick={onDelete}
              >
                Eliminar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

export default function CommentSection({ postId }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

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
    return () => {
      cancelled = true;
    };
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

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditError(null);
    setActionError(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
    setEditError(null);
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    const trimmedContent = editContent.trim();
    if (!trimmedContent || isSavingEdit) return;

    setIsSavingEdit(true);
    setEditError(null);
    try {
      await updateComment(editingCommentId, { content: trimmedContent });
      setComments((currentComments) =>
        currentComments.map((comment) =>
          comment.id === editingCommentId ? { ...comment, content: trimmedContent } : comment,
        ),
      );
      handleCancelEdit();
    } catch (err) {
      setEditError(err.message || 'No se pudo actualizar el comentario');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete || isDeleting) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await deleteComment(commentToDelete.id);
      const data = await getByPostId(postId);
      setComments(Array.isArray(data) ? data : []);
      setError(null);
      setCommentToDelete(null);
    } catch (err) {
      setActionError(err.message || 'No se pudo eliminar el comentario');
      setCommentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (!isDeleting) setCommentToDelete(null);
  };

  return (
    <section className={styles.section} aria-label="Comentarios">
      <h2 className={styles.title}>
        <span className="material-symbols-outlined" aria-hidden="true">
          comment
        </span>
        Comentarios
        {!loading && !error && <span className={styles.count}>{comments.length}</span>}
      </h2>

      {loading && (
        <div className={styles.spinnerWrapper}>
          <Spinner size="md" label="Cargando comentarios…" />
        </div>
      )}

      {!loading && error && (
        <p className={styles.errorMsg}>
          <span className="material-symbols-outlined" aria-hidden="true">
            error_outline
          </span>
          {error}
        </p>
      )}

      {!loading && !error && comments.length === 0 && (
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined" aria-hidden="true">
            chat_bubble_outline
          </span>
          <p>Aún no hay comentarios. ¡Sé el primero!</p>
        </div>
      )}

      {!loading && !error && comments.length > 0 && (
        <ul className={styles.commentList}>
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                isOwn={Boolean(user) && user.id === comment.authorId}
                isEditing={
                  Boolean(user) && user.id === comment.authorId && editingCommentId === comment.id
                }
                editContent={editContent}
                editError={editError}
                isSaving={isSavingEdit}
                onStartEdit={() => handleStartEdit(comment)}
                onEditContentChange={setEditContent}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDelete={() => {
                  setActionError(null);
                  setCommentToDelete(comment);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {actionError && (
        <p className={styles.actionError} role="alert">
          {actionError}
        </p>
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
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
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

      <ConfirmModal
        isOpen={Boolean(commentToDelete)}
        title="Eliminar comentario"
        message="¿Seguro que deseas eliminar este comentario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </section>
  );
}
