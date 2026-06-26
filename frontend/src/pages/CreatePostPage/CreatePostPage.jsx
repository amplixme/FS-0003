import { useNavigate } from "react-router-dom";
import PostForm from "../../components/posts/PostForm";
import { create } from "../../services/post.service";
import styles from "./CreatePostPage.module.css";

const getCreatedPost = (response) => response?.data ?? response;

const CreatePostPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    const response = await create(formData);
    const createdPost = getCreatedPost(response);

    if (createdPost?.id) {
      navigate(`/posts/${createdPost.id}`);
      return;
    }

    throw new Error("El post se creó, pero no pudimos abrir el detalle automáticamente.");
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Nuevo artículo</p>
        <h1 className={styles.title}>Crear post</h1>
        <p className={styles.description}>Completá el título, el contenido y elegí si querés publicarlo ahora.</p>
      </div>

      <PostForm onSubmit={handleSubmit} submitLabel="Crear post" />
    </section>
  );
};

export default CreatePostPage;
