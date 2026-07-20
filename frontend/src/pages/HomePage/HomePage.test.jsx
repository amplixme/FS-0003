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
  data: [{ id: 1, title: "React con debounce" }],
  total: 27,
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
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
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

describe("HomePage search", () => {
  it("carga búsqueda, categoría, orden y página desde la URL", async () => {
    const view = await renderHomePage("/?category=tecnologia&sort=oldest&search=react&page=2");

    expect(view.querySelector('input[aria-label="Buscar publicaciones"]').value).toBe("react");
    expect(view.textContent).toContain("React con debounce");
    expect(getAll).toHaveBeenCalledWith({
      page: 2,
      limit: 9,
      category: "tecnologia",
      sort: "oldest",
      search: "react",
    });

    await click(view.querySelector('button[aria-label="Ir a la página 3"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?category=tecnologia&sort=oldest&search=react&page=3");
    expect(getAll).toHaveBeenLastCalledWith({
      page: 3,
      limit: 9,
      category: "tecnologia",
      sort: "oldest",
      search: "react",
    });
  });

  it("aplica solo la última búsqueda después de 300ms", async () => {
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
      limit: 9,
      category: "tecnologia",
      sort: "newest",
      search: "react",
    });
  });

  it("limpia la búsqueda inmediatamente y conserva los demás filtros", async () => {
    const view = await renderHomePage("/?page=2&category=tecnologia&sort=oldest&search=react");

    await click(view.querySelector('button[aria-label="Limpiar búsqueda"]'));

    expect(view.querySelector('input[aria-label="Buscar publicaciones"]').value).toBe("");
    expect(view.querySelector('output[aria-label="URL actual"]').textContent)
      .toBe("/?category=tecnologia&sort=oldest");
    expect(getAll).toHaveBeenLastCalledWith({
      page: 1,
      limit: 9,
      category: "tecnologia",
      sort: "oldest",
      search: undefined,
    });
  });
});
