import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "../../components/common";
import { create } from "../../services/post.service";
import styles from "./CreatePostPage.module.css";

const validateForm = ({ title, content }) => {
  const errors = {};

  if (!title.trim()) {
    errors.title = "El título es requerido";
  }

  if (!content.trim()) {
    errors.content = "El contenido es requerido";
  }

  return errors;
};

const getCreatedPost = (response) => response?.data ?? response;

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await create({
        title: formData.title.trim(),
        content: formData.content.trim(),
        published: formData.published,
      });
      const createdPost = getCreatedPost(response);

      if (createdPost?.id) {
        navigate(`/posts/${createdPost.id}`);
        return;
      }

      setServerError("El post se creó, pero no pudimos abrir el detalle automáticamente.");
    } catch (error) {
      setServerError(error.message || "No pudimos crear el post. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Nuevo artículo</p>
        <h1 className={styles.title}>Crear post</h1>
        <p className={styles.description}>Completá el título, el contenido y elegí si querés publicarlo ahora.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {serverError && <ErrorMessage message={serverError} />}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">Título</label>
          <input
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            id="title"
            name="title"
            onChange={handleChange}
            placeholder="Escribí un título claro"
            type="text"
            value={formData.title}
          />
          {errors.title && <p className={styles.errorText}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="content">Contenido</label>
          <textarea
            className={`${styles.textarea} ${errors.content ? styles.inputError : ""}`}
            id="content"
            name="content"
            onChange={handleChange}
            placeholder="Desarrollá el contenido del post"
            rows="10"
            value={formData.content}
          />
          {errors.content && <p className={styles.errorText}>{errors.content}</p>}
        </div>

        <label className={styles.toggle}>
          <input
            checked={formData.published}
            className={styles.checkbox}
            name="published"
            onChange={handleChange}
            type="checkbox"
          />
          <span>
            <strong>{formData.published ? "Publicar ahora" : "Guardar como borrador"}</strong>
            <small>{formData.published ? "El post quedará visible al crearse." : "Podrás publicarlo más adelante."}</small>
          </span>
        </label>

        <div className={styles.actions}>
          <button className={styles.submitButton} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creando..." : "Crear post"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePostPage;
