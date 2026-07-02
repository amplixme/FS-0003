import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PostForm from "../../components/posts/PostForm";
import { Spinner } from "../../components/common";
import { getPostById, updatePost } from "../../services/post.service";
import styles from "./EditPostPage.module.css";

const getPostData = (response) => response?.data ?? response;

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getPostById(id);
        const data = getPostData(response);

        if (!cancelled) {
          if (!data) {
            setError("El post no existe.");
            return;
          }

          if (user && data.authorId !== user.id) {
            navigate("/", { replace: true });
            return;
          }

          setPost(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudo cargar el post.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchPost();
    }

    return () => { cancelled = true; };
  }, [id, user, navigate]);

  const handleSubmit = async (formData) => {
    const { published, ...allowedData } = formData;
    await updatePost(id, allowedData);
    navigate(`/posts/${id}`);
  };

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.status}>
          <Spinner size="lg" label="Cargando post" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.page}>
        <div className={styles.errorState}>
          <h2 className={styles.errorTitle}>Error</h2>
          <p className={styles.errorMessage}>{error}</p>
          <button className={styles.backButton} onClick={() => navigate("/")}>
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Editar artículo</p>
        <h1 className={styles.title}>Editar post</h1>
        <p className={styles.description}>Modificá el título, el contenido o el estado de publicación.</p>
      </div>

      <PostForm
        initialData={{ title: post.title, content: post.content, published: post.published }}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </section>
  );
};

export default EditPostPage;
