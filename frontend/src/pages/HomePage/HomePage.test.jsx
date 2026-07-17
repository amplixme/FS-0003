// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAll } from "../../services/post.service";
import HomePage from "./HomePage";

vi.mock("../../services/post.service", () => ({ getAll: vi.fn() }));

vi.mock("../../components/categories", () => ({
  CategoryFilter: ({ onChange }) => (
    <button type="button" aria-label="Filtrar Tecnología" onClick={() => onChange("tecnologia")}>
      Tecnología
    </button>
  ),
}));

vi.mock("../../components/posts/PostCard", () => ({
  default: ({ post }) => <article>{post.title}</article>,
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root;
let container;

const LocationProbe = () => {
  const location = useLocation();
  return <output aria-label="URL actual">{`${location.pathname}${location.search}`}</output>;
};

const response = {
  data: [{ id: 1, title: "Post de prueba" }],
  total: 30,
  page: 1,
  totalPages: 3,
};

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
};

const renderHomePage = async (initialEntry = "/") => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <HomePage />
        <LocationProbe />
      </MemoryRouter>,
    );
  });
  await settle();

  return container;
};

const click = async (element) => {
  await act(async () => {
    element.click();
  });
  await settle();
};

const typeSearch = async (input, value) => {
  await act(async () => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;
    valueSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const wait = async (milliseconds) => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  });
  await settle();
};

beforeEach(() => {
  getAll.mockReset();
  getAll.mockResolvedValue(response);
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe("HomePage filters and pagination", () => {
  it("sincroniza ?page=2 y solicita page=2 con limit=10 al elegir la página 2", async () => {
    const view = await renderHomePage();

    expect(getAll).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 10,
      category: undefined,
      search: undefined,
    });

    await click(view.querySelector('button[aria-label="Ir a la página 2"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent).toBe("/?page=2");
    expect(getAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 10,
      category: undefined,
      search: undefined,
    });
    expect(view.querySelector('button[aria-label="Ir a la página 2"]').getAttribute("aria-current"))
      .toBe("page");
  });

  it("reinicia a página 1 y elimina page de la URL al cambiar categoría", async () => {
    const view = await renderHomePage("/?page=2");

    expect(getAll).toHaveBeenNthCalledWith(1, {
      page: 2,
      limit: 10,
      category: undefined,
      search: undefined,
    });

    await click(view.querySelector('button[aria-label="Filtrar Tecnología"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?category=tecnologia");
    expect(getAll).toHaveBeenCalledTimes(2);
    expect(getAll).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      category: "tecnologia",
      search: undefined,
    });
  });

  it("carga page, category y search desde una URL compartible", async () => {
    const view = await renderHomePage("/?category=tecnologia&search=react");

    expect(view.querySelector('input[aria-label="Buscar publicaciones"]').value).toBe("react");
    expect(view.textContent).toContain("Post de prueba");
    expect(getAll).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 10,
      category: "tecnologia",
      search: "react",
    });

    await click(view.querySelector('button[aria-label="Ir a la página 2"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?category=tecnologia&search=react&page=2");
    expect(getAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 10,
      category: "tecnologia",
      search: "react",
    });
  });

  it("aplica la búsqueda tras 300ms, preserva categoría y reinicia página", async () => {
    const view = await renderHomePage("/?page=2&category=tecnologia");
    const input = view.querySelector('input[aria-label="Buscar publicaciones"]');

    await typeSearch(input, "r");
    await typeSearch(input, "rea");
    await typeSearch(input, "react");
    await wait(250);

    expect(getAll).toHaveBeenCalledTimes(1);
    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?page=2&category=tecnologia");

    await wait(70);

    expect(getAll).toHaveBeenCalledTimes(2);
    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?category=tecnologia&search=react");
    expect(getAll).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      category: "tecnologia",
      search: "react",
    });
  });

  it("limpia la búsqueda inmediatamente con el botón X y conserva la categoría", async () => {
    const view = await renderHomePage("/?category=tecnologia&search=react");

    await click(view.querySelector('button[aria-label="Limpiar búsqueda"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?category=tecnologia");
    expect(view.querySelector('input[aria-label="Buscar publicaciones"]').value).toBe("");
    expect(getAll).toHaveBeenCalledTimes(2);
    expect(getAll).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      category: "tecnologia",
      search: undefined,
    });
  });

  it("limpia un borrador sin reiniciar la página ni hacer otra consulta", async () => {
    const view = await renderHomePage("/?page=2&category=tecnologia");
    const input = view.querySelector('input[aria-label="Buscar publicaciones"]');

    await typeSearch(input, "react");
    await click(view.querySelector('button[aria-label="Limpiar búsqueda"]'));
    await wait(320);

    expect(input.value).toBe("");
    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?page=2&category=tecnologia");
    expect(getAll).toHaveBeenCalledTimes(1);
  });
});
