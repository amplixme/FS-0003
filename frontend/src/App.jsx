import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

const Home = () => <h1>Inicio</h1>;
const Login = () => <h1>Login</h1>;
const Register = () => <h1>Register</h1>;
const NotFound = () => <h1>404 - Página no encontrada</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
