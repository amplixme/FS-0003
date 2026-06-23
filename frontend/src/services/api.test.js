// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import api from './api';

const mock = new MockAdapter(api);

describe('api interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    mock.reset();
  });

  it('agrega Authorization header si hay token', async () => {
    localStorage.setItem('token', 'abc123');
    mock.onGet('/health').reply(200, { status: 'ok' });

    const res = await api.get('/health');
    expect(res.config.headers.Authorization).toBe('Bearer abc123');
  });

  it('borra el token si recibe 401', async () => {
    localStorage.setItem('token', 'bad-token');
    mock.onGet('/protected').reply(401);

    await api.get('/protected').catch(() => {});
    expect(localStorage.getItem('token')).toBeNull();
  });
});