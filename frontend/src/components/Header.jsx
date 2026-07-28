import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as categoryService from '../services/category.service';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/crear', label: 'Escribir' },
    ...(user?.role === 'ADMIN'
      ? [
          { to: '/categorias', label: 'Categorías' },
          { to: '/admin', label: 'Admin' },
        ]
      : []),
  ];

  useEffect(() => {
    categoryService
      .getAll()
      .then((data) => {
        const normalized = data.map((cat) => ({
          label: cat.name,
          slug: cat.slug,
          count: cat._count?.posts ?? 0,
        }));
        setCategories(normalized);
      })
      .catch(() => setCategories([]));
  }, []);

  const handleCategoryClick = (slug) => {
    setMobileOpen(false);
    navigate(`/?category=${slug}`);
  };

  return (
    <>
      {/* ── DESKTOP HEADER ── */}
      <header className="header">
        <Link className="logo" to="/">
          TuProyecto
        </Link>

        <nav className="desktopNav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`desktopNavLink${isActive(to) ? ' desktopNavLinkActive' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="headerActions">
          {isAuthenticated ? (
            // Usuario logueado: solo mostrar avatar
            <button
              className="avatarBtn"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de usuario"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="avatarImg" />
              ) : (
                <span className="avatarFallback">{user?.name?.[0]?.toUpperCase() ?? 'U'}</span>
              )}
            </button>
          ) : (
            // Usuario no logueado: mostrar Login (Subscribe eliminado)
            <Link to="/login" className="loginLink">
              Log In
            </Link>
          )}
        </div>

        <button
          className="hamburgerBtn"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú de navegación"
          aria-expanded={mobileOpen}
        >
          <span className="hamburgerBar" />
          <span className="hamburgerBar" />
          <span className="hamburgerBar" />
        </button>
      </header>

      {mobileOpen && (
        <div className="mobileOverlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside
        className={`mobileSidebar${mobileOpen ? ' mobileSidebarOpen' : ''}`}
        aria-label="Menú de navegación"
      >
        <div className="sidebarHeader">
          <span className="sidebarHeaderTitle">TuProyecto</span>
          <button
            className="sidebarCloseBtn"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Perfil */}
        {isAuthenticated ? (
          <Link
            to={`/perfil/${user.id}`}
            className="sidebarProfile"
            onClick={() => setMobileOpen(false)}
          >
            <div className="sidebarAvatarWrap">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="sidebarAvatarImg" />
              ) : (
                <span className="sidebarAvatarFallback">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
              )}
              <span className="onlineDot" aria-hidden="true" />
            </div>
            <p className="sidebarName">{user?.name ?? 'Invitado'}</p>
            <p className="sidebarEmail">{user?.email ?? ''}</p>
          </Link>
        ) : (
          <div className="sidebarProfile">
            <div className="sidebarAvatarWrap">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="sidebarAvatarImg" />
              ) : (
                <span className="sidebarAvatarFallback">
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </span>
              )}
              <span className="onlineDot" aria-hidden="true" />
            </div>
            <p className="sidebarName">{user?.name ?? 'Invitado'}</p>
            <p className="sidebarEmail">{user?.email ?? ''}</p>
          </div>
        )}

        <div className="sidebarDivider" />

        {/* {isAuthenticated && (
          <>
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
          </>
        )} */}

        <nav className="sidebarNav">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebarNavLink${isActive(to) ? ' sidebarNavLinkActive' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sidebarNavIcon" aria-hidden="true">
                {to === '/' && '🏠'}
                {to === '/crear' && '✏️'}
                {to === '/admin' && '🛡️'}
                {to === '/categorias' && '📂'}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {categories.length > 0 && (
          <div className="sidebarSection">
            <div className="sidebarSectionHeader">
              <span className="sidebarSectionTitle">CATEGORÍAS</span>
              <span className="sidebarSectionIcon" aria-hidden="true">
                📊
              </span>
            </div>
            <ul className="sidebarCategories" role="list">
              {categories.map(({ label, slug, count }) => (
                <li key={slug}>
                  <button className="sidebarCategoryLink" onClick={() => handleCategoryClick(slug)}>
                    <span>{label}</span>
                    <span className="sidebarCategoryCount">{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="sidebarFooter">
          {isAuthenticated ? (
            <button
              className="sidebarLogoutBtn"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
            >
              <span aria-hidden="true">↪</span>
              Cerrar Sesión
            </button>
          ) : (
            <div className="sidebarAuthLinks">
              <Link to="/login" className="sidebarAuthLink" onClick={() => setMobileOpen(false)}>
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="sidebarAuthLinkPrimary"
                onClick={() => setMobileOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          )}
          <p className="sidebarVersion">TU PROYECTO EDITORIAL</p>
        </div>
      </aside>
    </>
  );
};

export default Header;
