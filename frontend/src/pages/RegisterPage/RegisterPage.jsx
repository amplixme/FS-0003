import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import './RegisterPage.css';

const validateForm = ({ name, email, password, confirmPassword }) => {
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

  return errors;
};

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
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

      navigate('/login', { state: { success: 'Registro exitoso. Ahora puedes iniciar sesión.' } });
    } catch (err) {
      const message = err.message || 'Error del servidor. Intenta nuevamente.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerPage">
      <h1 className="title">Crear cuenta</h1>

      {serverError && <div className="serverError">{serverError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name" className="label">Nombre</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`input${errors.name ? ' inputError' : ''}`}
          />
          {errors.name && <small className="errorText">{errors.name}</small>}
        </div>

        <div className="field">
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`input${errors.email ? ' inputError' : ''}`}
          />
          {errors.email && <small className="errorText">{errors.email}</small>}
        </div>

        <div className="field">
          <label htmlFor="password" className="label">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`input${errors.password ? ' inputError' : ''}`}
          />
          {errors.password && <small className="errorText">{errors.password}</small>}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword" className="label">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`input${errors.confirmPassword ? ' inputError' : ''}`}
          />
          {errors.confirmPassword && (
            <small className="errorText">{errors.confirmPassword}</small>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="submitBtn"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="footer">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
