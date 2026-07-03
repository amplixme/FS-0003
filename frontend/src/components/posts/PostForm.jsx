import { useEffect, useState } from "react";
import { ErrorMessage } from "../common";
import { getAll as getCategories } from "../../services/category.service";
import styles from "./PostForm.module.css";

const defaultInitialData = { title: "", content: "", published: false, categoryIds: [] };

const getCategoryIds = (data) => {
  if (Array.isArray(data.categoryIds)) {
    return data.categoryIds.map(String);
  }

  if (Array.isArray(data.categories)) {
    return data.categories
      .map((category) => category?.id ?? category)
      .filter((categoryId) => categoryId != null)
      .map(String);
  }

  return [];
};

const getInitialFormData = (data = defaultInitialData) => ({
  title: data.title ?? "",
  content: data.content ?? "",
  published: data.published ?? false,
  categoryIds: getCategoryIds(data),
});

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

const PostForm = ({ initialData = defaultInitialData, onSubmit, submitLabel = "Guardar", serverError: externalError }) => {
  const [formData, setFormData] = useState(() => getInitialFormData(initialData));
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoriesError("");

      try {
        const data = await getCategories();

        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          setCategoriesError(error.message || "No pudimos cargar las categorías.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => { isMounted = false; };
  }, []);

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

  const handleCategoryChange = (event) => {
    const { checked, value } = event.target;

    setFormData((current) => ({
      ...current,
      categoryIds: checked
        ? [...current.categoryIds, value]
        : current.categoryIds.filter((categoryId) => categoryId !== value),
    }));
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
        categoryIds: formData.categoryIds,
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

      <div className={styles.field}>
        <span className={styles.label}>Categorías</span>
        {categoriesError && <p className={styles.errorText}>{categoriesError}</p>}
        {isLoadingCategories && <p className={styles.helpText}>Cargando categorías...</p>}
        {!isLoadingCategories && !categoriesError && categories.length === 0 && (
          <p className={styles.helpText}>No hay categorías disponibles.</p>
        )}
        {categories.length > 0 && (
          <div className={styles.categoryList}>
            {categories.map((category) => {
              const categoryId = String(category.id);

              return (
                <label className={styles.categoryOption} key={category.id}>
                  <input
                    checked={formData.categoryIds.includes(categoryId)}
                    className={styles.checkbox}
                    name="categoryIds"
                    onChange={handleCategoryChange}
                    type="checkbox"
                    value={categoryId}
                  />
                  <span>{category.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.submitButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PostForm;
