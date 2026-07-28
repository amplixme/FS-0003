import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './RegisterPage.css';

const STRENGTH_LABELS = {
  0: '',
  1: { label: 'Débil', color: 'var(--md-error)' },
  2: { label: 'Débil', color: 'var(--md-error)' },
  3: { label: 'Media', color: 'var(--md-primary)' },
  4: { label: 'Fuerte', color: '#16a34a' },
  5: { label: 'Muy fuerte', color: '#16a34a' },
};

const getPasswordStrength = (password) => {
  let score = 0;
  if (!password) return { score: 0, bars: 0, label: '', color: '' };
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const info = STRENGTH_LABELS[score] || STRENGTH_LABELS[0];
  return { score, bars: score, label: info.label, color: info.color };
};

const validateForm = ({ name, email, password, confirmPassword, acceptedTerms }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }

  if (!email) {
    errors.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Formato de email inválido';
  }

  if (!password) {
    errors.password = 'La contraseña es requerida';
  } else if (password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Debes confirmar la contraseña';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden';
  }

  if (!acceptedTerms) {
    errors.acceptedTerms = 'Debes aceptar los términos y condiciones';
  }

  return errors;
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      await apiClient.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate('/login', {
        state: { success: 'Registro exitoso. Ahora puedes iniciar sesión.' },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Error del servidor. Intenta nuevamente.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <main className="register-container">
        <div className="register-card">
          {/* Accent bar */}
          <div className="register-accent-bar" />

          <div className="register-content">
            {/* Brand */}
            <div className="register-brand">
              <span className="register-brand-text">TuProyecto</span>
            </div>

            {/* Header */}
            <header className="register-header">
              <h1 className="register-title">Crear cuenta</h1>
              <p className="register-subtitle">Únete a la comunidad</p>
            </header>

            {/* Formulario */}
            <form className="register-form" onSubmit={handleSubmit} noValidate>
              {/* Server error */}
              {serverError && (
                <div className="register-server-error" role="alert">
                  <span className="register-error-icon">error</span>
                  {serverError}
                </div>
              )}

              {/* Nombre completo */}
              <div className="register-field">
                <label className="register-label" htmlFor="name">
                  Nombre completo
                </label>
                <div className={`register-input-wrapper ${errors.name ? 'has-error' : ''}`}>
                  <span className="register-input-icon">person</span>
                  <input
                    className="register-input"
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                {errors.name && <span className="register-field-error">{errors.name}</span>}
              </div>

              {/* Email */}
              <div className="register-field">
                <label className="register-label" htmlFor="email">
                  Correo electrónico
                </label>
                <div className={`register-input-wrapper ${errors.email ? 'has-error' : ''}`}>
                  <span className="register-input-icon">mail</span>
                  <input
                    className="register-input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="register-field-error">{errors.email}</span>}
              </div>

              {/* Contraseña */}
              <div className="register-field">
                <label className="register-label" htmlFor="password">
                  Contraseña
                </label>
                <div className={`register-input-wrapper ${errors.password ? 'has-error' : ''}`}>
                  <span className="register-input-icon">lock</span>
                  <input
                    className="register-input"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {errors.password && (
                  <span className="register-field-error">{errors.password}</span>
                )}

                {/* Strength indicator */}
                {formData.password && (
                  <div className="register-strength">
                    <div className="register-strength-bars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="register-strength-bar"
                          style={{
                            background:
                              i <= strength.bars ? strength.color : 'var(--md-outline-variant)',
                          }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <span
                        className="register-strength-label"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className="register-field">
                <label className="register-label" htmlFor="confirmPassword">
                  Confirmar contraseña
                </label>
                <div
                  className={`register-input-wrapper ${errors.confirmPassword ? 'has-error' : ''}`}
                >
                  <span className="register-input-icon">enhanced_encryption</span>
                  <input
                    className="register-input"
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="register-field-error">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Términos y condiciones */}
              <label className="register-terms">
                <div className="register-checkbox-wrap">
                  <input
                    className="register-checkbox"
                    name="acceptedTerms"
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={handleChange}
                  />
                  <span className="register-checkbox-icon">check</span>
                </div>
                <span className="register-terms-text">
                  Acepto los{' '}
                  <a className="register-terms-link" href="#">
                    Términos y Condiciones
                  </a>{' '}
                  y la{' '}
                  <a className="register-terms-link" href="#">
                    Política de Privacidad
                  </a>{' '}
                  de TuProyecto.
                </span>
              </label>
              {errors.acceptedTerms && (
                <span className="register-field-error" style={{ marginTop: '-0.75rem' }}>
                  {errors.acceptedTerms}
                </span>
              )}

              {/* Submit */}
              <button
                className="register-submit-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            {/* Footer */}
            <footer className="register-footer">
              <p className="register-login-text">
                ¿Ya tienes cuenta?{' '}
                <Link className="register-login-link" to="/login">
                  Inicia sesión
                </Link>
              </p>
            </footer>
          </div>
        </div>

        {/* Footer links */}
        <div className="register-footer-links">
          <a href="#">Sobre nosotros</a>
          <a href="#">Ayuda</a>
          <a href="#">Blog</a>
          <a href="#">Contacto</a>
        </div>

        {/* Copyright */}
        <div className="register-copyright">
          <span>© 2024 TUPROYECTO. EDITORIAL AUTHORITY.</span>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;