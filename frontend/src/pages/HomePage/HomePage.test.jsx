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

describe("HomePage pagination", () => {
  it("sincroniza ?page=2 y solicita page=2 con limit=10 al elegir la página 2", async () => {
    const view = await renderHomePage();

    expect(getAll).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 10,
      category: undefined,
    });

    await click(view.querySelector('button[aria-label="Ir a la página 2"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent).toBe("/?page=2");
    expect(getAll).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 10,
      category: undefined,
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
    });

    await click(view.querySelector('button[aria-label="Filtrar Tecnología"]'));

    expect(view.querySelector('output[aria-label="URL actual"]').textContent).toBe("/");
    expect(getAll).toHaveBeenCalledTimes(2);
    expect(getAll).toHaveBeenLastCalledWith({
      page: 1,
      limit: 10,
      category: "tecnologia",
    });
  });
});
