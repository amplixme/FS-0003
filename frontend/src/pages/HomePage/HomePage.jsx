import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../../components/posts/PostCard";
import { EmptyState, ErrorMessage, Pagination, Spinner } from "../../components/common";
import { CategoryFilter } from "../../components/categories";
import { getAll } from "../../services/post.service";
import styles from "./HomePage.module.css";

const getPostsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.posts)) return response.posts;
  return [];
};

const POSTS_PER_PAGE = 10;

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const pendingCategory = useRef(null);
  const pageParam = searchParams.get("page");
  const parsedPage = Number(pageParam);
  const currentPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  useEffect(() => {
    if (pageParam === null) return;
    if (currentPage !== 1 && pageParam === String(currentPage)) return;

    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      if (currentPage === 1) nextParams.delete("page");
      else nextParams.set("page", String(currentPage));
      return nextParams;
    }, { replace: true });
  }, [currentPage, pageParam, setSearchParams]);

  useEffect(() => {
    if (pendingCategory.current) {
      const isCategoryReady = activeCategory === pendingCategory.current.value;
      if (currentPage !== 1 || !isCategoryReady) return;
      pendingCategory.current = null;
    }

    let isActive = true;
    const loadPosts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAll({
          page: currentPage,
          limit: POSTS_PER_PAGE,
          category: activeCategory || undefined,
        });
        if (isActive) {
          const responseTotalPages = Math.max(0, Number(response?.totalPages) || 0);
          const lastPage = Math.max(1, responseTotalPages);

          setTotalPages(responseTotalPages);
          if (currentPage > lastPage) {
            setSearchParams((params) => {
              const nextParams = new URLSearchParams(params);
              if (lastPage === 1) nextParams.delete("page");
              else nextParams.set("page", String(lastPage));
              return nextParams;
            }, { replace: true });
            return;
          }
          setPosts(getPostsFromResponse(response));
        }
      } catch {
        if (isActive) setError("No pudimos cargar las publicaciones. Intentá nuevamente en unos minutos.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    loadPosts();
    return () => { isActive = false; };
  }, [retryKey, activeCategory, currentPage, setSearchParams]);

  const changePage = (page) => {
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      if (page === 1) nextParams.delete("page");
      else nextParams.set("page", String(page));
      return nextParams;
    });
  };

  const changeCategory = (category) => {
    if (currentPage === 1 && category === activeCategory) return;

    pendingCategory.current = { value: category };
    setActiveCategory(category);
    changePage(1);
  };

  return (
    <section className={styles.homePage}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Publicaciones</p>
        <h1 className={styles.title}>Últimos posts</h1>
        <p className={styles.description}>Explorá las publicaciones más recientes de la comunidad.</p>
      </div>

      <div className={styles.body}>
        {/* Una sola instancia — el CSS interno decide sidebar vs chips */}
        <CategoryFilter activeSlug={activeCategory} onChange={changeCategory} />

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
                <PostCard key={post.id} post={post} onCategorySelect={changeCategory} />
              ))}
            </div>
          )}
          {!isLoading && !error && posts.length > 0 && (
            <div className={styles.pagination}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HomePage;
