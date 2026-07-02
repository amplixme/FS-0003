import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostById, deletePost } from "../../services/post.service";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal, Spinner, ErrorMessage, EmptyState } from "../../components/common";
import "./PostDetailPage.css";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPostById(id);
        if (!cancelled) setPost(data.data || data);
      } catch (err) {
        if (!cancelled) setError(err.message || "No se pudo cargar el artículo");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPost();
    return () => { cancelled = true; };
  }, [id]);

  const isAuthor = user && post && user.id === post.authorId;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      setShowDeleteModal(false);
      showToast("Artículo eliminado correctamente", "success");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      showToast(err.message || "Error al eliminar el artículo", "error");
    }
  };

  const headings = useMemo(() => {
    if (!post?.content) return [];
    return post.content
      .split("\n")
      .map((line) => {
        const t = line.trim();
        if (t.startsWith("## "))  return { level: 2, text: t.slice(3), id: t.slice(3).toLowerCase().replace(/\s+/g, "-") };
        if (t.startsWith("### ")) return { level: 3, text: t.slice(4), id: t.slice(4).toLowerCase().replace(/\s+/g, "-") };
        return null;
      })
      .filter(Boolean);
  }, [post]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <Spinner size="lg" label="Cargando artículo…" />
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
            retryLabel="Intentar de nuevo"
          />
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <EmptyState
            icon="search_off"
            message="El artículo que buscas no existe o ha sido eliminado."
            actionLabel="Volver al inicio"
            onAction={() => navigate("/")}
          />
        </div>
      </div>
    );
  }

  // --- Success State ---
  return (
    <>
      <div className="post-detail-page">
        <div className="post-detail-container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Inicio</Link>
            <span className="breadcrumb-separator material-symbols-outlined">chevron_right</span>
            <span className="breadcrumb-current">{post.title}</span>
          </nav>

          <div className="post-detail-layout">
            {/* Article */}
            <article className="post-article">
              {/* Hero */}
              <div className="post-hero">
                <div className="post-hero-image">
                  <div className="post-hero-placeholder">
                    <span className="material-symbols-outlined post-hero-icon">article</span>
                  </div>
                </div>
                {post.category && (
                  <span className="post-category-badge">{post.category}</span>
                )}
              </div>

              {/* Header */}
              <header className="post-header">
                <h1 className="post-title">{post.title}</h1>
                <div className="post-meta">
                  <div className="post-author">
                    <div className="post-author-avatar">
                      {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="post-author-info">
                      <span className="post-author-name">
                        {post.author?.name || "Usuario"}
                      </span>
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="post-content prose">
                {post.content?.split("\n").map((paragraph, i) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith("## "))  { const t = trimmed.slice(3);  const anchorId = t.toLowerCase().replace(/\s+/g, "-"); return <h2 key={i} id={anchorId}>{t}</h2>; }
                  if (trimmed.startsWith("### ")) { const t = trimmed.slice(4);  const anchorId = t.toLowerCase().replace(/\s+/g, "-"); return <h3 key={i} id={anchorId}>{t}</h3>; }
                  if (trimmed.startsWith("> "))   return <blockquote key={i}>{trimmed.slice(2)}</blockquote>;
                  if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) return <li key={i}>{trimmed.replace(/^[-*]\s/, "")}</li>;
                  return <p key={i}>{trimmed}</p>;
                })}
              </div>

              {/* Author Actions */}
              {isAuthor && (
                <div className="post-author-actions">
                  <button
                    className="btn btn-outline btn-icon"
                    onClick={() => navigate(`/posts/${post.id}/editar`)}
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Editar
                  </button>
                  <button
                    className="btn btn-outline btn-danger btn-icon"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                    Eliminar
                  </button>
                </div>
              )}

              {/* Volver al inicio */}
              <div className="post-back">
                <Link to="/" className="btn btn-text btn-icon">
                  <span className="material-symbols-outlined">arrow_back</span>
                  Volver al inicio
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="post-sidebar">
              <div className="sidebar-sticky">
                {headings.length > 0 && (
                  <div className="sidebar-card">
                    <div className="sidebar-card-header">
                      <span className="material-symbols-outlined sidebar-card-icon">list_alt</span>
                      <h4 className="sidebar-card-title">Tabla de contenidos</h4>
                    </div>
                    <nav className="sidebar-toc">
                      {headings.map((h, i) => (
                        <a
                          key={i}
                          href={`#${h.id}`}
                          className={`sidebar-toc-link ${h.level === 3 ? "sidebar-toc-sublink" : ""}`}
                        >
                          <span className={`sidebar-toc-bullet ${h.level === 3 ? "sidebar-toc-bullet-sub" : ""}`} />
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                <div className="sidebar-cta">
                  <h4 className="sidebar-cta-title">¿Te gustó el artículo?</h4>
                  <p className="sidebar-cta-text">
                    Recibí las mejores historias de diseño y tecnología cada semana.
                  </p>
                  <input className="sidebar-cta-input" type="email" placeholder="tu@email.com" />
                  <button className="btn btn-primary sidebar-cta-btn">Suscribirse</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="¿Eliminar este artículo?"
        message="¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
        danger
      />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`toast toast--${toast.type}`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}