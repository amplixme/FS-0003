import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un correo válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setServerError("");

    try {
      const response = await apiClient.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Credenciales inválidas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <main className="login-container">
        <div className="login-card">
          {/* Barra de acento superior */}
          <div className="login-accent-bar" />

          <div className="login-content">
            {/* Brand */}
            <div className="login-brand">
              <span className="login-brand-text">TuProyecto</span>
            </div>

            {/* Header */}
            <header className="login-header">
              <h1 className="login-title">Iniciar sesión</h1>
              <p className="login-subtitle">
                Ingresa a tu cuenta para continuar
              </p>
            </header>

            {/* Formulario */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {/* Error del servidor */}
              {serverError && (
                <div className="login-server-error" role="alert">
                  <span className="login-error-icon">error</span>
                  {serverError}
                </div>
              )}

              {/* Campo Email */}
              <div className="login-field">
                <label className="login-label" htmlFor="email">
                  Correo electrónico
                </label>
                <div className={`login-input-wrapper ${errors.email ? "has-error" : ""}`}>
                  <span className="login-input-icon">mail</span>
                  <input
                    className="login-input"
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <span className="login-field-error">{errors.email}</span>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="login-field">
                <div className="login-label-row">
                  <label className="login-label" htmlFor="password">
                    Contraseña
                  </label>
                  <a className="login-forgot-link" href="#">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className={`login-input-wrapper ${errors.password ? "has-error" : ""}`}>
                  <span className="login-input-icon">lock</span>
                  <input
                    className="login-input login-input-password"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    className="login-visibility-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="login-input-icon">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <span className="login-field-error">{errors.password}</span>
                )}
              </div>

              {/* Botón Submit */}
              <button
                className="login-submit-btn"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>

            {/* Separador */}
            <div className="login-separator">
              <span className="login-separator-text">o</span>
            </div>

            {/* Botón Google (placeholder) */}
            <div className="login-social">
              <button className="login-google-btn" type="button" disabled>
                <span className="login-google-icon">G</span>
                Continuar con Google
              </button>
            </div>

            {/* Footer - Link a registro */}
            <footer className="login-footer">
              <p className="login-register-text">
                ¿No tienes cuenta?{" "}
                <Link className="login-register-link" to="/register">
                  Regístrate
                </Link>
              </p>
            </footer>
          </div>
        </div>

        {/* Copyright */}
        <div className="login-copyright">
          <span>© 2024 TuProyecto</span>
          <div className="login-copyright-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
          </div>
        </div>
      </main>
    </div>
  );
}
