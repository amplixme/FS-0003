import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <Link className="logo" to="/">FS-0003</Link>

      <button className="menu" onClick={() => setOpen(!open)}>
        ☰
      </button>

      <nav className={open ? "nav navOpen" : "nav"}>
        <Link to="/" onClick={() => setOpen(false)}>Inicio</Link>

        {isAuthenticated ? (
          <>
            <span className="userName">{user?.name}</span>
            <button className="logoutBtn" onClick={logout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;