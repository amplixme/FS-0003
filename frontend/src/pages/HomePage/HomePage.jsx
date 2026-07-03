import { useEffect, useState } from "react";
import PostCard from "../../components/posts/PostCard";
import { EmptyState, ErrorMessage, Spinner } from "../../components/common";
import { CategoryFilter } from "../../components/categories";
import { getAll } from "../../services/post.service";
import styles from "./HomePage.module.css";

const getPostsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.posts)) return response.posts;
  return [];
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let isActive = true;
    const loadPosts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAll(activeCategory ? { category: activeCategory } : undefined);
        if (isActive) setPosts(getPostsFromResponse(response));
      } catch {
        if (isActive) setError("No pudimos cargar las publicaciones. Intentá nuevamente en unos minutos.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    loadPosts();
    return () => { isActive = false; };
  }, [retryKey, activeCategory]);

  return (
    <section className={styles.homePage}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Publicaciones</p>
        <h1 className={styles.title}>Últimos posts</h1>
        <p className={styles.description}>Explorá las publicaciones más recientes de la comunidad.</p>
      </div>

      <div className={styles.body}>
        {/* Una sola instancia — el CSS interno decide sidebar vs chips */}
        <CategoryFilter activeSlug={activeCategory} onChange={setActiveCategory} />

        <div className={styles.content}>
          {isLoading && (
            <div className={styles.status}>
              <Spinner size="lg" label="Cargando publicaciones" />
            </div>
          )}
          {!isLoading && error && (
            <div className={styles.status}>
              <ErrorMessage message={error} onRetry={() => setRetryKey((c) => c + 1)} />
            </div>
          )}
          {!isLoading && !error && posts.length === 0 && (
            <div className={styles.status}>
              <EmptyState message="No hay publicaciones en esta categoría" />
            </div>
          )}
          {!isLoading && !error && posts.length > 0 && (
            <div className={styles.grid}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onCategorySelect={setActiveCategory} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomePage;
