// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../context/AuthContext';
import { create, deleteComment, getByPostId, update } from '../../services/comment.service';
import CommentSection from './CommentSection';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../services/comment.service', () => ({
  create: vi.fn(),
  deleteComment: vi.fn(),
  getByPostId: vi.fn(),
  update: vi.fn(),
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

const changeTextarea = (textarea, value) => {
  const setTextareaValue = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  ).set;
  setTextareaValue.call(textarea, value);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
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
    getByPostId.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: 'comment-1',
        content: 'Comentario nuevo',
        createdAt: '2026-07-13T10:00:00.000Z',
        author: { name: 'Ana' },
      },
    ]);

    let resolveCreate;
    create.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );

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

  it('muestra las acciones solo en los comentarios del usuario autenticado', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: 7 } });
    getByPostId.mockResolvedValue([
      {
        id: 'own-comment',
        authorId: 7,
        content: 'Comentario propio',
        author: { name: 'Ana' },
      },
      {
        id: 'other-comment',
        authorId: 8,
        content: 'Comentario ajeno',
        author: { name: 'Luis' },
      },
    ]);

    const view = await renderCommentSection();
    const items = view.querySelectorAll('li');

    expect(items[0].textContent).toContain('Editar');
    expect(items[0].textContent).toContain('Eliminar');
    expect(items[1].textContent).not.toContain('Editar');
    expect(items[1].textContent).not.toContain('Eliminar');
  });

  it('edita un comentario propio inline y restaura las acciones al guardar', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: 7 } });
    getByPostId.mockResolvedValue([
      {
        id: 'comment-1',
        authorId: 7,
        content: 'Texto original',
        author: { name: 'Ana' },
      },
    ]);
    update.mockResolvedValue({});

    const view = await renderCommentSection();
    const editButton = [...view.querySelectorAll('button')].find(
      (button) => button.textContent === 'Editar',
    );

    act(() => editButton.click());

    const editTextarea = view.querySelector('textarea[aria-label="Editar comentario"]');
    expect(editTextarea.value).toBe('Texto original');
    expect(view.textContent).toContain('Guardar');
    expect(view.textContent).toContain('Cancelar');
    expect(view.textContent).not.toContain('Eliminar');

    act(() => changeTextarea(editTextarea, 'Texto descartado'));
    const cancelButton = [...view.querySelectorAll('button')].find(
      (button) => button.textContent === 'Cancelar',
    );
    act(() => cancelButton.click());

    expect(view.textContent).toContain('Texto original');
    expect(view.textContent).not.toContain('Texto descartado');
    expect(update).not.toHaveBeenCalled();

    const restoredEditButton = [...view.querySelectorAll('button')].find(
      (button) => button.textContent === 'Editar',
    );
    act(() => restoredEditButton.click());

    const restoredTextarea = view.querySelector('textarea[aria-label="Editar comentario"]');
    act(() => changeTextarea(restoredTextarea, '  Texto actualizado  '));

    await act(async () => {
      restoredTextarea
        .closest('form')
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(update).toHaveBeenCalledWith('comment-1', { content: 'Texto actualizado' });
    expect(view.textContent).toContain('Texto actualizado');
    expect(view.querySelector('textarea[aria-label="Editar comentario"]')).toBeNull();
    expect(view.textContent).toContain('Editar');
    expect(view.textContent).toContain('Eliminar');
  });

  it('abre ConfirmModal al eliminar y recarga la lista después de confirmar', async () => {
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: 7 } });
    getByPostId
      .mockResolvedValueOnce([
        {
          id: 'comment-1',
          authorId: 7,
          content: 'Comentario a eliminar',
          author: { name: 'Ana' },
        },
      ])
      .mockResolvedValueOnce([]);
    deleteComment.mockResolvedValue({});

    const view = await renderCommentSection();
    const deleteButton = [...view.querySelectorAll('button')].find(
      (button) => button.textContent === 'Eliminar',
    );

    act(() => deleteButton.click());

    const modal = view.querySelector('[role="dialog"]');
    expect(modal).not.toBeNull();
    expect(modal.textContent).toContain('Eliminar comentario');

    const confirmButton = [...modal.querySelectorAll('button')].find(
      (button) => button.textContent === 'Eliminar',
    );

    await act(async () => confirmButton.click());

    expect(deleteComment).toHaveBeenCalledWith('comment-1');
    expect(getByPostId).toHaveBeenCalledTimes(2);
    expect(view.querySelector('[role="dialog"]')).toBeNull();
    expect(view.textContent).not.toContain('Comentario a eliminar');
  });
});
