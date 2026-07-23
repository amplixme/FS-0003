const proxyquire = require('proxyquire');

const mockUserModel = { findUnique: vi.fn(), create: vi.fn() };
const mockBcrypt = { hash: vi.fn(), compare: vi.fn() };
const mockJwt = { sign: vi.fn() };

const { registerUser, loginUser } = proxyquire('../auth.service', {
  bcrypt: mockBcrypt,
  jsonwebtoken: mockJwt,
  '../utils/prisma': { user: mockUserModel },
});

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('registerUser', () => {
  it('crea un usuario y retorna mensaje de exito', async () => {
    mockUserModel.findUnique.mockResolvedValue(null);
    mockBcrypt.hash.mockResolvedValue('hashed-password');
    mockUserModel.create.mockResolvedValue({});

    const result = await registerUser({
      email: 'new@test.com',
      password: '123456',
      name: 'New User',
    });

    expect(mockUserModel.findUnique).toHaveBeenCalledWith({
      where: { email: 'new@test.com' },
    });
    expect(mockBcrypt.hash).toHaveBeenCalledWith('123456', 10);
    expect(mockUserModel.create).toHaveBeenCalledWith({
      data: {
        email: 'new@test.com',
        password: 'hashed-password',
        name: 'New User',
      },
    });
    expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
  });

  it('lanza error 409 cuando el email ya esta registrado', async () => {
    mockUserModel.findUnique.mockResolvedValue({ id: 1, email: 'existing@test.com' });

    await expect(
      registerUser({ email: 'existing@test.com', password: '123456', name: 'Existing' }),
    ).rejects.toMatchObject({
      message: 'El email ya está registrado',
      status: 409,
    });

    expect(mockUserModel.create).not.toHaveBeenCalled();
  });
});

describe('loginUser', () => {
  const mockUser = {
    id: 1,
    email: 'user@test.com',
    name: 'Test User',
    role: 'USER',
    bio: null,
    avatarUrl: null,
    password: 'hashed-password',
  };

  beforeEach(() => {
    mockBcrypt.compare.mockResolvedValue(true);
    mockJwt.sign.mockReturnValue('mock-token');
  });

  it('loguea un usuario con credenciales validas y retorna token', async () => {
    mockUserModel.findUnique.mockResolvedValue(mockUser);

    const result = await loginUser('user@test.com', 'correct-password');

    expect(mockUserModel.findUnique).toHaveBeenCalledWith({
      where: { email: 'user@test.com' },
    });
    expect(mockBcrypt.compare).toHaveBeenCalledWith('correct-password', 'hashed-password');
    expect(mockJwt.sign).toHaveBeenCalledWith(
      {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'USER',
        bio: null,
        avatarUrl: null,
      },
      'test-secret',
      { expiresIn: '24h' },
    );
    expect(result).toEqual({
      token: 'mock-token',
      user: {
        id: 1,
        email: 'user@test.com',
        name: 'Test User',
        role: 'USER',
        bio: null,
        avatarUrl: null,
      },
    });
  });

  it('lanza error 401 cuando la contrasena es incorrecta', async () => {
    mockUserModel.findUnique.mockResolvedValue(mockUser);
    mockBcrypt.compare.mockResolvedValue(false);

    await expect(loginUser('user@test.com', 'wrong-password')).rejects.toMatchObject({
      message: 'Credenciales inválidas',
      status: 401,
    });
  });

  it('lanza error 401 cuando el usuario no existe', async () => {
    mockUserModel.findUnique.mockResolvedValue(null);
    mockBcrypt.compare.mockResolvedValue(false);

    await expect(loginUser('nonexistent@test.com', 'any-password')).rejects.toMatchObject({
      message: 'Credenciales inválidas',
      status: 401,
    });

    expect(mockBcrypt.compare).toHaveBeenCalled();
    expect(mockJwt.sign).not.toHaveBeenCalled();
  });
});
