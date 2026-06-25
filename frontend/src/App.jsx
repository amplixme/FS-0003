import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import PostDetailPage from "./pages/PostDetailPage/PostDetailPage";
import "./App.css";

const Home = () => <h1>Inicio</h1>;
const CreatePost = () => <h1>Crear Post</h1>;
const NotFound = () => <h1>404 - Página no encontrada</h1>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/posts/:id" element={<PostDetailPage />} />
            <Route path="/crear" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
