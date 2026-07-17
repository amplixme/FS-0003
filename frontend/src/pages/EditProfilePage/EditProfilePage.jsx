import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/user.service";
import { Spinner } from "../../components/common";
import "./EditProfilePage.css";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateProfile({
        name: name.trim(),
        bio: bio?.trim() || null,
      });

      const updatedUser = result.data;
      login(token, { ...user, ...updatedUser });
      navigate(`/perfil/${user.id}`);
    } catch (err) {
      setError(err.message || "Error al guardar el perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        {/* Header */}
        <header className="edit-profile-header">
          <h1 className="edit-profile-title">Editar Perfil</h1>
          <p className="edit-profile-subtitle">
            Personaliza tu identidad digital en la plataforma.
          </p>
        </header>

        {/* Edit Card */}
        <section className="edit-profile-card">
          {/* Avatar Section (display only — upload out of scope) */}
          <div className="edit-profile-avatar-section">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="edit-profile-avatar"
              />
            ) : (
              <div className="edit-profile-avatar-fallback">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Inline Error */}
          {error && (
            <div className="edit-profile-api-error" role="alert">
              <span className="material-symbols-outlined edit-profile-error-icon" aria-hidden="true">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">
                Nombre completo
              </label>
              <input
                id="full_name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                minLength={2}
                required
              />
            </div>

            {/* Bio Field */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <span className="form-char-count">{bio.length} / 200</span>
              </div>
              <textarea
                id="bio"
                className="form-textarea"
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setBio(e.target.value);
                  }
                }}
                placeholder="Breve descripción para tu perfil público"
                rows={4}
              />
              <p className="form-helper-text">
                Breve descripción para tu perfil público.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner size="sm" label="Guardando..." />
                    <span>Guardando...</span>
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </button>

              <Link
                to={`/perfil/${user.id}`}
                className="btn-cancel"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </section>

        {/* Privacy Banner */}
        <div className="info-banner">
          <div className="info-banner-content">
            <span className="material-symbols-outlined info-banner-icon" aria-hidden="true">info</span>
            <div>
              <h4 className="info-banner-title">Privacidad del Perfil</h4>
              <p className="info-banner-text">
                Tu nombre y biografía serán visibles para otros usuarios. No compartas
                información sensible como direcciones o contraseñas en tu biografía.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
