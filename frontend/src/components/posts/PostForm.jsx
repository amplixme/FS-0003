import { useState } from "react";
import { ErrorMessage } from "../common";
import styles from "./PostForm.module.css";

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

const PostForm = ({ initialData = { title: "", content: "", published: false }, onSubmit, submitLabel = "Guardar", serverError: externalError }) => {
  const [formData, setFormData] = useState(initialData);
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
      await onSubmit({
        title: formData.title.trim(),
        content: formData.content.trim(),
        published: formData.published,
      });
    } catch (error) {
      setServerError(error.message || "Ocurrió un error. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = serverError || externalError;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {displayError && <ErrorMessage message={displayError} />}

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
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
