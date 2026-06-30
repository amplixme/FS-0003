import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostById } from "../../services/post.service";
import { useAuth } from "../../context/AuthContext";
import "./PostDetailPage.css";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPostById(id);
        if (!cancelled) {
          setPost(data.data || data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudo cargar el artículo");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPost();
    return () => { cancelled = true; };
  }, [id]);

  const isAuthor = user && post && user.id === post.authorId;

  // Extraer headings del contenido para la tabla de contenidos
  const headings = useMemo(() => {
    if (!post?.content) return [];
    const lines = post.content.split("\n");
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("## ")) {
          return { level: 2, text: trimmed.replace("## ", ""), id: trimmed.replace("## ", "").toLowerCase().replace(/\s+/g, "-") };
        }
        if (trimmed.startsWith("### ")) {
          return { level: 3, text: trimmed.replace("### ", ""), id: trimmed.replace("### ", "").toLowerCase().replace(/\s+/g, "-") };
        }
        return null;
      })
      .filter(Boolean);
  }, [post]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="skeleton breadcrumb-skeleton" />
          <div className="skeleton hero-skeleton" />
          <div className="skeleton title-skeleton" />
          <div className="skeleton author-skeleton" />
          <div className="skeleton content-skeleton" />
          <div className="skeleton content-skeleton short" />
          <div className="skeleton content-skeleton" />
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="error-state">
            <span className="error-state-icon material-symbols-outlined">error_outline</span>
            <h2 className="error-state-title">Algo salió mal</h2>
            <p className="error-state-message">{error}</p>
            <div className="error-state-actions">
              <Link to="/" className="btn btn-primary">Volver al inicio</Link>
              <button
                className="btn btn-outline"
                onClick={() => window.location.reload()}
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Empty State (post not found handled by API as 404) ---
  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="error-state">
            <span className="error-state-icon material-symbols-outlined">search_off</span>
            <h2 className="error-state-title">Artículo no encontrado</h2>
            <p className="error-state-message">
              El artículo que buscas no existe o ha sido eliminado.
            </p>
            <Link to="/" className="btn btn-primary">Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Success State ---
  return (
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
                    <span className="post-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Content */}
            <div className="post-content prose">
              {post.content?.split("\n").map((paragraph, i) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Detect basic markdown-ish elements
                if (trimmed.startsWith("## ")) {
                  const text = trimmed.replace("## ", "");
                  const id = text.toLowerCase().replace(/\s+/g, "-");
                  return <h2 key={i} id={id}>{text}</h2>;
                }
                if (trimmed.startsWith("### ")) {
                  const text = trimmed.replace("### ", "");
                  const id = text.toLowerCase().replace(/\s+/g, "-");
                  return <h3 key={i} id={id}>{text}</h3>;
                }
                if (trimmed.startsWith("> ")) {
                  return <blockquote key={i}>{trimmed.replace("> ", "")}</blockquote>;
                }
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                  return <li key={i}>{trimmed.replace(/^[-*]\s/, "")}</li>;
                }

                return <p key={i}>{trimmed}</p>;
              })}
            </div>

            {/* Author Actions (only visible to the author) */}
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
                  onClick={() => {
                    if (window.confirm("¿Estás seguro de que querés eliminar este artículo?")) {
                      // TODO: conectar con deletePost cuando esté disponible en frontend
                    }
                  }}
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

          {/* Sidebar (desktop only) */}
          <aside className="post-sidebar">
            <div className="sidebar-sticky">
              {/* Tabla de contenidos */}
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

              {/* CTA Newsletter */}
              <div className="sidebar-cta">
                <h4 className="sidebar-cta-title">¿Te gustó el artículo?</h4>
                <p className="sidebar-cta-text">
                  Recibí las mejores historias de diseño y tecnología cada semana.
                </p>
                <input
                  className="sidebar-cta-input"
                  type="email"
                  placeholder="tu@email.com"
                />
                <button className="btn btn-primary sidebar-cta-btn">
                  Suscribirse
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
