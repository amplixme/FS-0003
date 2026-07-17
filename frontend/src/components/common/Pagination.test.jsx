// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import Pagination from "./Pagination";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root;
let container;

const renderPagination = (props) => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  act(() => {
    root.render(<Pagination {...props} />);
  });

  return container;
};

const buttonByLabel = (view, label) =>
  view.querySelector(`button[aria-label="${label}"]`);

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe("Pagination", () => {
  it("no renderiza controles cuando hay cero o una página", () => {
    const view = renderPagination({ currentPage: 1, totalPages: 1, onPageChange: vi.fn() });

    expect(view.querySelector("nav")).toBeNull();
  });

  it("respeta el límite inferior y permite avanzar por next y por número", () => {
    const onPageChange = vi.fn();
    const view = renderPagination({ currentPage: 1, totalPages: 3, onPageChange });
    const previous = buttonByLabel(view, "Página anterior");
    const next = buttonByLabel(view, "Página siguiente");

    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    expect(buttonByLabel(view, "Ir a la página 1").getAttribute("aria-current")).toBe("page");

    act(() => next.click());
    act(() => buttonByLabel(view, "Ir a la página 3").click());

    expect(onPageChange.mock.calls).toEqual([[2], [3]]);
  });

  it("respeta el límite superior y permite retroceder", () => {
    const onPageChange = vi.fn();
    const view = renderPagination({ currentPage: 3, totalPages: 3, onPageChange });
    const previous = buttonByLabel(view, "Página anterior");
    const next = buttonByLabel(view, "Página siguiente");

    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(true);

    act(() => previous.click());

    expect(onPageChange).toHaveBeenCalledOnce();
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("acota los números visibles e incluye la página activa", () => {
    const view = renderPagination({ currentPage: 50, totalPages: 100, onPageChange: vi.fn() });
    const pageLabels = Array.from(view.querySelectorAll('button[aria-label^="Ir a la página"]'))
      .map((button) => button.textContent);

    expect(pageLabels).toEqual(["1", "49", "50", "51", "100"]);
    expect(view.textContent.match(/…/g)).toHaveLength(2);
  });
});
