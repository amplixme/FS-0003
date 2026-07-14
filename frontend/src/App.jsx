import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import CreatePostPage from "./pages/CreatePostPage/CreatePostPage";
import EditPostPage from "./pages/EditPostPage/EditPostPage";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import PostDetailPage from "./pages/PostDetailPage/PostDetailPage";
import CategoryManagePage from "./pages/CategoryManagePage/CategoryManagePage";
import AdminPage from "./pages/AdminPage/AdminPage";
import NotFound from "./components/NotFound";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/crear" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
              <Route path="/posts/:id/editar" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
              <Route path="/categorias" element={<ProtectedRoute><CategoryManagePage /></ProtectedRoute>} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;