import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/user.service';
import ImageUpload from '../../components/common/ImageUpload';
import styles from './EditProfilePage.module.css';

const MAX_BIO_LENGTH = 200;

const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [nameTouched, setNameTouched] = useState(false);

  const nameError =
    nameTouched && (!name.trim() || name.trim().length < 2)
      ? 'El nombre debe tener al menos 2 caracteres.'
      : null;

  const isValid = name.trim().length >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSaving(true);
    setError(null);

    try {
      const result = await updateProfile({ name: name.trim(), bio: bio.trim(), avatarUrl });
      updateUser(result?.data ?? result);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate(-1);

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Configuración</p>
        <h1 className={styles.title}>Editar perfil</h1>
        <p className={styles.description}>Actualizá tu nombre, biografía y foto de perfil.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Avatar */}
        <ImageUpload
          onUpload={(url) => setAvatarUrl(url)}
          onClear={() => setAvatarUrl('')}
          initialUrl={avatarUrl}
          label="Foto de perfil"
        />

        {/* Nombre */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-name">
            Nombre
          </label>
          <input
            id="edit-name"
            className={`${styles.input}${nameError ? ` ${styles.inputError}` : ''}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            placeholder="Tu nombre"
            disabled={saving}
            required
            maxLength={50}
          />
          {nameError && (
            <p className={styles.errorText} role="alert">
              {nameError}
            </p>
          )}
        </div>

        {/* Bio */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="edit-bio">
            Biografía
          </label>
          <textarea
            id="edit-bio"
            className={styles.textarea}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Contá un poco sobre vos..."
            disabled={saving}
            maxLength={MAX_BIO_LENGTH}
            rows={4}
          />
          <div className={styles.charCounter}>
            <span className={bio.length > MAX_BIO_LENGTH ? styles.charOver : ''}>{bio.length}</span>
            /{MAX_BIO_LENGTH}
          </div>
        </div>

        {/* Error global */}
        {error && (
          <div className={styles.globalError} role="alert">
            <span className="material-symbols-outlined" aria-hidden="true">
              error
            </span>
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={!isValid || saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditProfilePage;
