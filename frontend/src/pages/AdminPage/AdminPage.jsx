import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/admin.service';
import './AdminPage.css';

// ── Modal genérico ──────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="adminModalOverlay" onClick={onClose}>
    <div className="adminModal" onClick={(e) => e.stopPropagation()}>
      <div className="adminModalHeader">
        <h3>{title}</h3>
        <button className="adminModalClose" onClick={onClose}>✕</button>
      </div>
      <div className="adminModalBody">{children}</div>
    </div>
  </div>
);

// ── Stats Cards ─────────────────────────────────────────────────
const StatsSection = ({ stats }) => (
  <section className="adminSection">
    <h2 className="adminSectionTitle">Estadísticas</h2>
    <div className="adminStatsGrid">
      <div className="adminStatCard">
        <span className="adminStatIcon">👥</span>
        <span className="adminStatValue">{stats.totalUsers}</span>
        <span className="adminStatLabel">Usuarios</span>
      </div>
      <div className="adminStatCard">
        <span className="adminStatIcon">📝</span>
        <span className="adminStatValue">{stats.totalPosts}</span>
        <span className="adminStatLabel">Posts</span>
      </div>
      <div className="adminStatCard">
        <span className="adminStatIcon">💬</span>
        <span className="adminStatValue">{stats.totalComments}</span>
        <span className="adminStatLabel">Comentarios</span>
      </div>
    </div>
  </section>
);

// ── Formulario Usuario ──────────────────────────────────────────
const UserForm = ({ initial = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    password: '',
    role: initial.role || 'USER',
  });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password;
    onSubmit(data);
  };

  return (
    <form onSubmit={submit} className="adminForm">
      <label>Nombre
        <input name="name" value={form.name} onChange={handle} required />
      </label>
      <label>Email
        <input name="email" type="email" value={form.email} onChange={handle} required />
      </label>
      {!initial.id && (
        <label>Contraseña
          <input name="password" type="password" value={form.password} onChange={handle} required />
        </label>
      )}
      <label>Rol
        <select name="role" value={form.role} onChange={handle}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </label>
      <button type="submit" className="adminBtn adminBtnPrimary" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
};

// ── Sección Usuarios ────────────────────────────────────────────
const UsersSection = ({ currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | { type:'edit', user }
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const data = await adminService.getUsers();
    setUsers(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data) => {
    setSaving(true);
    setError('');
    try {
      await adminService.createUser(data);
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    setError('');
    try {
      await adminService.updateUser(modal.user.id, data);
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`¿Cambiar rol de ${user.name} a ${newRole}?`)) return;
    try {
      await adminService.changeUserRole(user.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`¿Eliminar usuario ${user.name}? Se eliminarán sus posts y comentarios.`)) return;
    try {
      await adminService.deleteUser(user.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <section className="adminSection">
      <div className="adminSectionHead">
        <h2 className="adminSectionTitle">Usuarios</h2>
        <button className="adminBtn adminBtnPrimary" onClick={() => setModal('create')}>
          + Crear usuario
        </button>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Nombre</th><th>Email</th><th>Rol</th><th>Registro</th><th>Posts</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`adminRoleBadge ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString('es-PE')}</td>
                <td>{u.postCount}</td>
                <td className="adminActions">
                  <button
                    className="adminBtn adminBtnSm"
                    onClick={() => setModal({ type: 'edit', user: u })}
                  >Editar</button>
                  {u.id !== currentUserId && (
                    <>
                      <button
                        className="adminBtn adminBtnSm adminBtnWarning"
                        onClick={() => handleRoleToggle(u)}
                      >
                        {u.role === 'ADMIN' ? '→ USER' : '→ ADMIN'}
                      </button>
                      <button
                        className="adminBtn adminBtnSm adminBtnDanger"
                        onClick={() => handleDelete(u)}
                      >Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === 'create' && (
        <Modal title="Crear usuario" onClose={() => { setModal(null); setError(''); }}>
          {error && <p className="adminError">{error}</p>}
          <UserForm onSubmit={handleCreate} loading={saving} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Editar usuario" onClose={() => { setModal(null); setError(''); }}>
          {error && <p className="adminError">{error}</p>}
          <UserForm initial={modal.user} onSubmit={handleEdit} loading={saving} />
        </Modal>
      )}
    </section>
  );
};

// ── Sección Posts ───────────────────────────────────────────────
const PostsSection = () => {
  const [posts, setPosts] = useState([]);

  const load = useCallback(async () => {
    const data = await adminService.getPosts();
    setPosts(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (post) => {
    if (!confirm(`¿Eliminar el post "${post.title}"?`)) return;
    try {
      await adminService.deletePost(post.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <section className="adminSection">
      <h2 className="adminSectionTitle">Posts recientes</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr><th>Título</th><th>Autor</th><th>Categorías</th><th>Fecha</th><th></th></tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.author?.name}</td>
                <td>{p.categories?.map((c) => c.name).join(', ') || '—'}</td>
                <td>{new Date(p.createdAt).toLocaleDateString('es-PE')}</td>
                <td>
                  <button
                    className="adminBtn adminBtnSm adminBtnDanger"
                    onClick={() => handleDelete(p)}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ── Sección Comentarios ─────────────────────────────────────────
const CommentsSection = () => {
  const [comments, setComments] = useState([]);

  const load = useCallback(async () => {
    const data = await adminService.getComments();
    setComments(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (c) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await adminService.deleteComment(c.id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <section className="adminSection">
      <h2 className="adminSectionTitle">Comentarios recientes</h2>
      <ul className="adminCommentList">
        {comments.map((c) => (
          <li key={c.id} className="adminCommentItem">
            <div className="adminCommentMeta">
              <strong>{c.author?.name}</strong>
              <span> en </span>
              <em>{c.post?.title}</em>
              <span className="adminCommentDate">
                {new Date(c.createdAt).toLocaleDateString('es-PE')}
              </span>
            </div>
            <p className="adminCommentContent">{c.content}</p>
            <button
              className="adminBtn adminBtnSm adminBtnDanger"
              onClick={() => handleDelete(c)}
            >Eliminar</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

// ── Página principal ────────────────────────────────────────────
const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('users');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="adminPage">
      <header className="adminHeader">
        <h1 className="adminTitle">🛡️ Panel de Administración</h1>
      </header>

      {stats && <StatsSection stats={stats} />}

      <nav className="adminTabs">
        {['users', 'posts', 'comments'].map((t) => (
          <button
            key={t}
            className={`adminTab${tab === t ? ' adminTabActive' : ''}`}
            onClick={() => setTab(t)}
          >
            {{ users: '👥 Usuarios', posts: '📝 Posts', comments: '💬 Comentarios' }[t]}
          </button>
        ))}
      </nav>

      {tab === 'users' && <UsersSection currentUserId={currentUser?.id} />}
      {tab === 'posts' && <PostsSection />}
      {tab === 'comments' && <CommentsSection />}
    </div>
  );
};

export default AdminPage;