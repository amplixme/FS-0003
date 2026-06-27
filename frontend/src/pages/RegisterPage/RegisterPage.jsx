import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../../services/apiClient";

const validateForm = ({ name, email, password, confirmPassword }) => {
  const errors = {};

  if (!name || name.trim().length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
  }

  if (!email) {
    errors.email = "El email es requerido";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Formato de email inválido";
  }

  if (!password) {
    errors.password = "La contraseña es requerida";
  } else if (password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Debes confirmar la contraseña";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  return errors;
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      await apiClient.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login", { state: { success: "Registro exitoso. Ahora puedes iniciar sesión." } });
    } catch (err) {
      const message = err.message || "Error del servidor. Intenta nuevamente.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
      <h1>Crear cuenta</h1>

      {serverError && (
        <div style={{ color: "red", marginBottom: "16px", padding: "8px", border: "1px solid red", borderRadius: "4px" }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="name" style={{ display: "block", marginBottom: "4px" }}>Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", border: errors.name ? "1px solid red" : "1px solid #ccc", borderRadius: "4px" }}
          />
          {errors.name && <small style={{ color: "red" }}>{errors.name}</small>}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "4px" }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", border: errors.email ? "1px solid red" : "1px solid #ccc", borderRadius: "4px" }}
          />
          {errors.email && <small style={{ color: "red" }}>{errors.email}</small>}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "4px" }}>Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", border: errors.password ? "1px solid red" : "1px solid #ccc", borderRadius: "4px" }}
          />
          {errors.password && <small style={{ color: "red" }}>{errors.password}</small>}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "4px" }}>Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", border: errors.confirmPassword ? "1px solid red" : "1px solid #ccc", borderRadius: "4px" }}
          />
          {errors.confirmPassword && <small style={{ color: "red" }}>{errors.confirmPassword}</small>}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>

      <p style={{ marginTop: "16px", textAlign: "center" }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
