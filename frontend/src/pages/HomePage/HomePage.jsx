import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostCard from "../../components/posts/PostCard";
import { EmptyState, ErrorMessage, Pagination, Spinner } from "../../components/common";
import { CategoryFilter } from "../../components/categories";
import { getAll } from "../../services/post.service";
import styles from "./HomePage.module.css";

const POSTS_PER_PAGE = 9;
const SORT_OPTIONS = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "comments", label: "Más comentados" },
];

const getPostsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.posts)) return response.posts;
  return [];
};

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const pageParam = Number.parseInt(searchParams.get("page"), 10);
  const currentPage = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const sortParam = searchParams.get("sort");
  const currentSort = SORT_OPTIONS.some((opt) => opt.value === sortParam) ? sortParam : "newest";

  const changePage = (page) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (page === 1) nextParams.delete("page");
      else nextParams.set("page", String(page));
      return nextParams;
    });
  };

  const changeCategory = (category) => {
    setActiveCategory(category);
    changePage(1);
  };

  const changeSort = (sort) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (sort === "newest") nextParams.delete("sort");
      else nextParams.set("sort", sort);
      nextParams.delete("page");
      return nextParams;
    });
  };

  useEffect(() => {
    let isActive = true;
    const loadPosts = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAll({
          page: currentPage,
          limit: POSTS_PER_PAGE,
          category: activeCategory || undefined,
          sort: currentSort,
        });
        if (isActive) {
          const responseTotalPages = Math.max(Number(response?.totalPages) || 1, 1);

          if (currentPage > responseTotalPages) {
            setSearchParams((currentParams) => {
              const nextParams = new URLSearchParams(currentParams);
              if (responseTotalPages === 1) nextParams.delete("page");
              else nextParams.set("page", String(responseTotalPages));
              return nextParams;
            });
            return;
          }

          setPosts(getPostsFromResponse(response));
          setTotalPages(responseTotalPages);
        }
      } catch {
        if (isActive) setError("No pudimos cargar las publicaciones. Intentá nuevamente en unos minutos.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    loadPosts();
    return () => { isActive = false; };
  }, [retryKey, activeCategory, currentPage, currentSort, setSearchParams]);

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
          <div className={styles.toolbar}>
            <div className={styles.sortGroup}>
              <label className={styles.sortLabel} htmlFor="sort-select">Ordenar</label>
              <select
                id="sort-select"
                className={styles.sortSelect}
                value={currentSort}
                onChange={(e) => changeSort(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

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
