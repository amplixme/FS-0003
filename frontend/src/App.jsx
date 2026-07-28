import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage/RegisterPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage/CreatePostPage'));
const EditPostPage = lazy(() => import('./pages/EditPostPage/EditPostPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage/PostDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage/EditProfilePage'));
const CategoryManagePage = lazy(() => import('./pages/CategoryManagePage/CategoryManagePage'));
const AdminPage = lazy(() => import('./pages/AdminPage/AdminPage'));
const NotFound = lazy(() => import('./components/NotFound'));

const PageLoader = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <p role="status">Cargando página...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={PageLoader}>
            <Routes>
              {/* Standalone pages — no Layout (navbar/footer) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Pages with Layout (navbar + footer) */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/crear"
                  element={
                    <ProtectedRoute>
                      <CreatePostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/posts/:id/editar"
                  element={
                    <ProtectedRoute>
                      <EditPostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil/editar"
                  element={
                    <ProtectedRoute>
                      <EditProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categorias"
                  element={
                    <ProtectedAdminRoute>
                      <CategoryManagePage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminPage />
                    </ProtectedAdminRoute>
                  }
                />
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/perfil/:id" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
