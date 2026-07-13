// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../context/AuthContext';
import { create, getByPostId } from '../../services/comment.service';
import CommentSection from './CommentSection';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../services/comment.service', () => ({
  create: vi.fn(),
  getByPostId: vi.fn(),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root;
let container;

const renderCommentSection = async () => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);

  await act(async () => {
    root.render(
      <MemoryRouter>
        <CommentSection postId="post-1" />
      </MemoryRouter>,
    );
  });

  return container;
};

beforeEach(() => {
  vi.clearAllMocks();
  getByPostId.mockResolvedValue([]);
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
});

describe('CommentSection', () => {
  it('muestra el enlace de login y oculta el formulario si no está autenticado', async () => {
    useAuth.mockReturnValue({ isAuthenticated: false });
    const view = await renderCommentSection();

    expect(view.querySelector('form')).toBeNull();
    expect(view.querySelector('textarea')).toBeNull();
    expect(view.querySelector('a[href="/login"]')?.textContent).toBe('Inicia sesión');
    expect(view.textContent).toContain('Inicia sesión para comentar');
  });

  it('crea el comentario, muestra loading, recarga la lista y limpia el textarea', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true });
    getByPostId
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'comment-1',
          content: 'Comentario nuevo',
          createdAt: '2026-07-13T10:00:00.000Z',
          author: { name: 'Ana' },
        },
      ]);

    let resolveCreate;
    create.mockReturnValue(new Promise((resolve) => {
      resolveCreate = resolve;
    }));

    const view = await renderCommentSection();
    const textarea = view.querySelector('textarea');
    const form = view.querySelector('form');

    act(() => {
      const setTextareaValue = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      ).set;
      setTextareaValue.call(textarea, '  Comentario nuevo  ');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    act(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(create).toHaveBeenCalledWith('post-1', { content: 'Comentario nuevo' });
    expect(view.querySelector('button').textContent).toBe('Comentando…');
    expect(view.querySelector('button').disabled).toBe(true);

    await act(async () => {
      resolveCreate();
    });

    expect(getByPostId).toHaveBeenCalledTimes(2);
    expect(textarea.value).toBe('');
    expect(view.textContent).toContain('Comentario nuevo');
    expect(view.querySelector('button').textContent).toBe('Comentar');
  });
});
