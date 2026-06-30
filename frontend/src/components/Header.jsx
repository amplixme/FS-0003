import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/categorias", label: "Categorías" },
    { to: "/crear", label: "Escribir" },
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  // Categorías de ejemplo — reemplaza con datos reales desde contexto/API
  const categories = [
    { label: "Tecnología", count: 24 },
    { label: "Diseño", count: 18 },
    { label: "Programación", count: 42 },
    { label: "DevOps", count: 12 },
    { label: "Opinión", count: 7 },
  ];

  return (
    <>
      {/* ── DESKTOP HEADER ── */}
      <header className="header">
        <Link className="logo" to="/">TuProyecto</Link>

        <nav className="desktopNav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`desktopNavLink${isActive(to) ? " desktopNavLinkActive" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="headerActions">
          {isAuthenticated ? (
            <>
              <Link to="/login" className="loginLink">Log In</Link>
              <button className="subscribeBtn">Subscribe</button>
              <button
                className="avatarBtn"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú de usuario"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatarImg" />
                ) : (
                  <span className="avatarFallback">
                    {user?.name?.[0]?.toUpperCase() ?? "U"}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="loginLink">Log In</Link>
              <Link to="/register" className="subscribeBtn">Subscribe</Link>
            </>
          )}
        </div>
      </header>

      {/* ── MOBILE SIDE PANEL ── */}
      {mobileOpen && (
        <div
          className="mobileOverlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`mobileSidebar${mobileOpen ? " mobileSidebarOpen" : ""}`}>
        {/* Perfil */}
        <div className="sidebarProfile">
          <div className="sidebarAvatarWrap">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="sidebarAvatarImg" />
            ) : (
              <span className="sidebarAvatarFallback">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </span>
            )}
            <span className="onlineDot" aria-hidden="true" />
          </div>
          <p className="sidebarName">{user?.name ?? "Invitado"}</p>
          <p className="sidebarEmail">{user?.email ?? ""}</p>
        </div>

        <div className="sidebarDivider" />

        {/* Nav links */}
        <nav className="sidebarNav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebarNavLink${isActive(to) ? " sidebarNavLinkActive" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebarNavIcon" aria-hidden="true">
                {to === "/" && "🏠"}
                {to === "/crear" && "✏️"}
                {to === "/admin" && "🛡️"}
                {to === "/categorias" && "📂"}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Categorías */}
        <div className="sidebarSection">
          <div className="sidebarSectionHeader">
            <span className="sidebarSectionTitle">CATEGORÍAS</span>
            <span className="sidebarSectionIcon" aria-hidden="true">📊</span>
          </div>
          <ul className="sidebarCategories" role="list">
            {categories.map(({ label, count }) => (
              <li key={label}>
                <Link
                  to={`/categorias/${label.toLowerCase()}`}
                  className="sidebarCategoryLink"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{label}</span>
                  <span className="sidebarCategoryCount">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer del panel */}
        <div className="sidebarFooter">
          {isAuthenticated && (
            <button
              className="sidebarLogoutBtn"
              onClick={() => { logout(); setMobileOpen(false); }}
            >
              <span aria-hidden="true">↪</span>
              Cerrar Sesión
            </button>
          )}
          <p className="sidebarVersion">TU PROYECTO EDITORIAL </p>
        </div>
      </aside>
    </>
  );
};

export default Header;