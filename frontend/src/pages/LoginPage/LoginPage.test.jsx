// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";

const { mockPost, mockLogin, mockNavigate } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockLogin: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("../../services/apiClient", () => ({
  default: { post: mockPost },
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLoginPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage validacion", () => {
  it("muestra errores cuando se envia el formulario vacio", async () => {
    renderLoginPage();

    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByText("El correo es obligatorio")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
  });

  it("muestra error para email invalido", async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "invalido");
    await userEvent.type(screen.getByLabelText("Contraseña"), "123456");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByText("Ingresa un correo válido")).toBeInTheDocument();
  });

  it("muestra error para contrasena corta", async () => {
    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "test@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "123");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(screen.getByText("La contraseña debe tener al menos 6 caracteres")).toBeInTheDocument();
  });
});

describe("LoginPage submit", () => {
  it("llama a login y navega al inicio en caso exitoso", async () => {
    mockPost.mockResolvedValue({
      data: { token: "mock-token", user: { id: 1, name: "Test" } },
    });

    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "user@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "123456");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "user@test.com",
        password: "123456",
      });
    });
    expect(mockLogin).toHaveBeenCalledWith("mock-token", { id: 1, name: "Test" });
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("muestra mensaje de error del servidor cuando falla", async () => {
    mockPost.mockRejectedValue(new Error("Credenciales inválidas"));

    renderLoginPage();

    await userEvent.type(screen.getByLabelText("Correo electrónico"), "user@test.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
  });
});
