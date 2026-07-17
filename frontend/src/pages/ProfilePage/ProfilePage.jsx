import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../services/user.service";
import { getPosts } from "../../services/post.service";
import { useAuth } from "../../context/AuthContext";
import { Spinner, ErrorMessage, EmptyState } from "../../components/common";
import PostCard from "../../components/posts/PostCard";
import "./ProfilePage.css";

const getPostsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.posts)) return response.posts;
  return [];
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const [profileData, postsData] = await Promise.all([
          getProfile(id),
          getPosts({ authorId: id, limit: 12 }),
        ]);
        if (!cancelled) {
          setProfile(profileData.data || profileData);
          setPosts(getPostsFromResponse(postsData));
        }
      } catch (err) {
        if (!cancelled) {
          if (err.message?.toLowerCase().includes("no encontrado") || err.message?.includes("404")) {
            setNotFound(true);
          } else {
            setError(err.message || "No se pudo cargar el perfil");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const isOwnProfile = authUser && profile && authUser.id === profile.id;

  // --- Loading State ---
  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <Spinner size="lg" label="Cargando perfil..." />
        </div>
      </div>
    );
  }

  // --- Not Found State ---
  if (notFound) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <EmptyState
            icon="person_off"
            message="Usuario no encontrado"
            actionLabel="Volver al inicio"
            onAction={() => navigate("/")}
          />
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
            retryLabel="Intentar de nuevo"
          />
        </div>
      </div>
    );
  }

  // --- Success State ---
  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Card */}
        <section className="profile-card">
          <div className="profile-avatar-section">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {profile.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{profile.name}</h1>

            {profile.bio && <p className="profile-bio">{profile.bio}</p>}

            <div className="profile-stats">
              <span className="profile-stat">
                <span className="material-symbols-outlined profile-stat-icon" aria-hidden="true">article</span>
                {profile.postCount ?? profile._count?.posts ?? 0} artículos publicados
              </span>
              {profile.createdAt && (
                <>
                  <span className="profile-stat-dot" aria-hidden="true">·</span>
                  <span className="profile-stat">
                    <span className="material-symbols-outlined profile-stat-icon" aria-hidden="true">calendar_today</span>
                    Miembro desde {formatDate(profile.createdAt)}
                  </span>
                </>
              )}
            </div>

            {isOwnProfile && (
              <Link to="/perfil/editar" className="profile-edit-btn">
                <span className="material-symbols-outlined profile-edit-btn-icon" aria-hidden="true">edit</span>
                Editar perfil
              </Link>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className="profile-tab profile-tab--active" type="button">
            <span className="material-symbols-outlined profile-tab-icon" aria-hidden="true">article</span>
            Publicaciones
          </button>
        </div>

        {/* Posts */}
        <section className="profile-posts-section">
          {posts.length === 0 ? (
            <EmptyState
              icon="inbox"
              message="Este usuario aún no ha publicado artículos"
            />
          ) : (
            <div className="profile-posts-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onCategorySelect={() => {}} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
