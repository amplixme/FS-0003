// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import PostCard from "./PostCard";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const categories = [
  { id: "1", name: "Tecnología", slug: "tecnologia" },
  { id: "2", name: "Backend", slug: "backend-slug" },
  { id: "3", name: "UX", slug: "ux" },
  { id: "4", name: "DevOps", slug: "devops" },
  { id: "5", name: "Producto", slug: "producto" },
];

const post = {
  id: 42,
  title: "Post con categorías",
  content: "Contenido del post",
  createdAt: "2026-07-02T12:00:00.000Z",
  author: { name: "Ana" },
  categories,
};

let root;
let container;

const renderPostCard = (props = {}) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(
      <MemoryRouter>
        <PostCard post={post} {...props} />
      </MemoryRouter>,
    );
  });

  return container;
};

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe("PostCard", () => {
  it("renderiza normal cuando el post no tiene categorías", () => {
    const view = renderPostCard({ post: { ...post, categories: [] }, onCategorySelect: vi.fn() });

    expect(view.textContent).toContain("Post con categorías");
    expect(view.textContent).toContain("Contenido del post");
    expect(view.querySelectorAll("button")).toHaveLength(0);
    expect(view.textContent).not.toContain("+");
  });

  it.each([
    [1, ["Tecnología"]],
    [2, ["Tecnología", "Backend"]],
    [3, ["Tecnología", "Backend", "UX"]],
  ])("muestra %s badges sin contador", (count, expectedBadges) => {
    const view = renderPostCard({
      post: { ...post, categories: categories.slice(0, count) },
      onCategorySelect: vi.fn(),
    });
    const badges = Array.from(view.querySelectorAll("button")).map((button) => button.textContent);

    expect(badges).toEqual(expectedBadges);
    expect(view.textContent).not.toContain("+");
  });

  it("muestra hasta 3 badges de categoría y el contador restante", () => {
    const view = renderPostCard({ onCategorySelect: vi.fn() });
    const badges = Array.from(view.querySelectorAll("button")).map((button) => button.textContent);

    expect(badges).toEqual(["Tecnología", "Backend", "UX"]);
    expect(view.textContent).toContain("+2");
    expect(view.textContent).not.toContain("DevOps");
  });

  it("filtra por slug, no por name, al clickear una categoría", () => {
    const onCategorySelect = vi.fn();
    const view = renderPostCard({ onCategorySelect });
    const backendBadge = Array.from(view.querySelectorAll("button")).find(
      (button) => button.textContent === "Backend",
    );

    act(() => {
      backendBadge.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onCategorySelect).toHaveBeenCalledWith("backend-slug");
    expect(onCategorySelect).not.toHaveBeenCalledWith("Backend");
  });

  it("no dispara filtro al clickear el contador de categorías restantes", () => {
    const onCategorySelect = vi.fn();
    const view = renderPostCard({ onCategorySelect });
    const moreBadge = Array.from(view.querySelectorAll("span")).find((span) => span.textContent === "+2");

    act(() => {
      moreBadge.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onCategorySelect).not.toHaveBeenCalled();
  });

  it("mantiene el link al detalle del post", () => {
    const view = renderPostCard({ onCategorySelect: vi.fn() });

    expect(view.querySelector('a[href="/posts/42"]')).not.toBeNull();
  });
});
