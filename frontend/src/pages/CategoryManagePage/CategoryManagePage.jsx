import { useEffect, useState } from "react";
import { getAll, create, update, remove } from "../../services/category.service";
import { ConfirmModal, ErrorMessage, Spinner } from "../../components/common";
import styles from "./CategoryManagePage.module.css";

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

const CategoryManagePage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNewNameChange = (e) => {
    const name = e.target.value;
    setNewName(name);
    setNewSlug(slugify(name));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    setError("");
    try {
      await create({ name: newName.trim(), slug: newSlug || slugify(newName) });
      setNewName("");
      setNewSlug("");
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditSlug("");
  };

  const handleEditNameChange = (e) => {
    const name = e.target.value;
    setEditName(name);
    setEditSlug(slugify(name));
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    setIsSavingEdit(true);
    setError("");
    try {
      await update(id, { name: editName.trim(), slug: editSlug || slugify(editName) });
      cancelEditing();
      await fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = (category) => {
    setDeleteTarget(category);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      setDeleteError(err.message);
      if (err.message.includes("409") || err.message.toLowerCase().includes("posts")) {
        setDeleteError("No se puede eliminar una categoría con posts asociados");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de categorías</h1>
      </div>

      {error && <ErrorMessage message={error} />}

      <form className={styles.createForm} onSubmit={handleCreate}>
        <div className={styles.createRow}>
          <input
            className={styles.input}
            placeholder="Nombre de la categoría"
            value={newName}
            onChange={handleNewNameChange}
          />
          <input
            className={styles.input}
            placeholder="slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
          <button className={styles.createBtn} disabled={isCreating || !newName.trim()} type="submit">
            {isCreating ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className={styles.status}>
          <Spinner size="lg" label="Cargando categorías" />
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <p className={styles.empty}>No hay categorías todavía. Creá una arriba.</p>
      )}

      {!isLoading && categories.length > 0 && (
        <div className={styles.list}>
          {categories.map((category) => (
            <div key={category.id} className={styles.row}>
              {editingId === category.id ? (
                <>
                  <input
                    className={styles.editInput}
                    value={editName}
                    onChange={handleEditNameChange}
                  />
                  <input
                    className={styles.editInput}
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                  />
                  <div className={styles.rowActions}>
                    <button
                      className={styles.saveBtn}
                      disabled={isSavingEdit || !editName.trim()}
                      onClick={() => handleSaveEdit(category.id)}
                    >
                      {isSavingEdit ? "Guardando..." : "Guardar"}
                    </button>
                    <button className={styles.cancelBtn} onClick={cancelEditing}>
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.name}>{category.name}</span>
                  <span className={styles.slug}>{category.slug}</span>
                  <span className={styles.count}>
                    {category._count?.posts ?? 0} posts
                  </span>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => startEditing(category)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => confirmDelete(category)}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Eliminar categoría"
        message={
          deleteTarget
            ? `¿Estás seguro de eliminar "${deleteTarget.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError("");
        }}
        isLoading={isDeleting}
        danger
      />

      {deleteError && (
        <div className={styles.deleteError}>
          <ErrorMessage message={deleteError} />
        </div>
      )}
    </section>
  );
};

export default CategoryManagePage;
