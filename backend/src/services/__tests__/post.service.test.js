const proxyquire = require('proxyquire');

const mockPostModel = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
};
const mockPrisma = { post: mockPostModel };

const { createPost, updatePost, deletePost, getAllPosts, getPostById } = proxyquire(
  '../post.service',
  {
    '../utils/prisma': mockPrisma,
  },
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getAllPosts', () => {
  it('retorna posts paginados con los campos transformados', async () => {
    const posts = [
      {
        id: 1,
        title: 'Post 1',
        content: 'Content',
        _count: { comments: 3 },
        author: { id: 1, name: 'A', email: 'a@a.com' },
        categories: [],
      },
    ];
    mockPostModel.findMany.mockResolvedValue(posts);
    mockPostModel.count.mockResolvedValue(1);

    const result = await getAllPosts({ page: 1, limit: 10 });

    expect(result).toEqual({
      data: [
        {
          id: 1,
          title: 'Post 1',
          content: 'Content',
          commentCount: 3,
          author: { id: 1, name: 'A', email: 'a@a.com' },
          categories: [],
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });
    expect(mockPostModel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true }, skip: 0, take: 10 }),
    );
    expect(mockPostModel.count).toHaveBeenCalledWith({ where: { published: true } });
  });

  it('filtra por categoria cuando se pasa categorySlug', async () => {
    mockPostModel.findMany.mockResolvedValue([]);
    mockPostModel.count.mockResolvedValue(0);

    await getAllPosts({ categorySlug: 'tecnologia' });

    expect(mockPostModel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categories: { some: { slug: 'tecnologia' } },
        }),
      }),
    );
  });

  it('filtra por search cuando se pasa el parametro', async () => {
    mockPostModel.findMany.mockResolvedValue([]);
    mockPostModel.count.mockResolvedValue(0);

    await getAllPosts({ search: 'javascript' });

    expect(mockPostModel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: 'javascript', mode: 'insensitive' } },
            { content: { contains: 'javascript', mode: 'insensitive' } },
          ],
        }),
      }),
    );
  });
});

describe('getPostById', () => {
  it('retorna el post cuando existe', async () => {
    const post = {
      id: 1,
      title: 'Post',
      author: { id: 1, name: 'A', email: 'a@a.com' },
      categories: [],
    };
    mockPostModel.findUnique.mockResolvedValue(post);

    const result = await getPostById(1);

    expect(result).toEqual(post);
    expect(mockPostModel.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
      },
    });
  });

  it('retorna null cuando el post no existe', async () => {
    mockPostModel.findUnique.mockResolvedValue(null);

    const result = await getPostById(999);

    expect(result).toBeNull();
  });
});

describe('createPost', () => {
  it('crea un post con todos los campos incluyendo categorias', async () => {
    const newPost = {
      id: 1,
      title: 'Nuevo Post',
      content: 'Contenido',
      coverImage: 'https://img.com/img.jpg',
      published: true,
      authorId: 1,
      author: { id: 1, name: 'Author', email: 'a@a.com' },
      categories: [{ id: 'cat-1', name: 'Tech', slug: 'tech' }],
    };
    mockPostModel.create.mockResolvedValue(newPost);

    const result = await createPost(
      {
        title: 'Nuevo Post',
        content: 'Contenido',
        published: true,
        coverImage: 'https://img.com/img.jpg',
        categoryIds: ['cat-1'],
      },
      1,
    );

    expect(result).toEqual(newPost);
    expect(mockPostModel.create).toHaveBeenCalledWith({
      data: {
        title: 'Nuevo Post',
        content: 'Contenido',
        coverImage: 'https://img.com/img.jpg',
        authorId: 1,
        published: true,
        categories: { connect: [{ id: 'cat-1' }] },
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
      },
    });
  });
});

describe('updatePost', () => {
  const existingPost = { id: 1, title: 'Old', authorId: 1 };
  const user = { id: 1, role: 'USER' };
  const adminUser = { id: 2, role: 'ADMIN' };

  it('actualiza el post cuando el usuario es el autor', async () => {
    mockPostModel.findUnique.mockResolvedValue(existingPost);
    mockPostModel.update.mockResolvedValue({ ...existingPost, title: 'Updated' });

    const result = await updatePost(1, { title: 'Updated' }, user);

    expect(result.title).toBe('Updated');
    expect(mockPostModel.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'Updated' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        categories: true,
      },
    });
  });

  it('lanza 403 cuando el usuario no es el autor ni admin', async () => {
    mockPostModel.findUnique.mockResolvedValue(existingPost);
    const otherUser = { id: 2, role: 'USER' };

    await expect(updatePost(1, { title: 'Updated' }, otherUser)).rejects.toMatchObject({
      message: 'No tienes permiso para modificar este post',
      status: 403,
    });

    expect(mockPostModel.update).not.toHaveBeenCalled();
  });

  it('permite actualizar a un usuario ADMIN aunque no sea el autor', async () => {
    mockPostModel.findUnique.mockResolvedValue(existingPost);
    mockPostModel.update.mockResolvedValue({ ...existingPost, title: 'Admin Updated' });

    const result = await updatePost(1, { title: 'Admin Updated' }, adminUser);

    expect(result.title).toBe('Admin Updated');
  });

  it('lanza 404 cuando el post no existe', async () => {
    mockPostModel.findUnique.mockResolvedValue(null);

    await expect(updatePost(999, { title: 'Nope' }, user)).rejects.toMatchObject({
      message: 'Post no encontrado',
      status: 404,
    });

    expect(mockPostModel.update).not.toHaveBeenCalled();
  });
});

describe('deletePost', () => {
  const existingPost = { id: 1, title: 'Post', authorId: 1 };
  const user = { id: 1, role: 'USER' };
  const otherUser = { id: 2, role: 'USER' };

  it('elimina el post cuando el usuario es el autor', async () => {
    mockPostModel.findUnique.mockResolvedValue(existingPost);
    mockPostModel.delete.mockResolvedValue(existingPost);

    await deletePost(1, user);

    expect(mockPostModel.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('lanza 403 cuando el usuario no es el autor ni admin', async () => {
    mockPostModel.findUnique.mockResolvedValue(existingPost);

    await expect(deletePost(1, otherUser)).rejects.toMatchObject({
      message: 'No tienes permiso para modificar este post',
      status: 403,
    });

    expect(mockPostModel.delete).not.toHaveBeenCalled();
  });

  it('lanza 404 cuando el post no existe', async () => {
    mockPostModel.findUnique.mockResolvedValue(null);

    await expect(deletePost(999, user)).rejects.toMatchObject({
      message: 'Post no encontrado',
      status: 404,
    });

    expect(mockPostModel.delete).not.toHaveBeenCalled();
  });
});
