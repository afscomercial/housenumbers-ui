import { vi } from 'vitest'

export const mockFetch = (response: unknown, options: { ok?: boolean; status?: number } = {}) => {
  const mockResponse = {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    text: () => Promise.resolve(JSON.stringify(response)),
    json: () => Promise.resolve(response)
  }
  
  vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as Response)
  return mockResponse
}

export const mockApiClient = {
  login: vi.fn(),
  createSnippet: vi.fn(),
  getSnippets: vi.fn(),
  getSnippet: vi.fn(),
  deleteSnippet: vi.fn()
}

export const mockUser = {
  id: 'user-123',
  username: 'admin',
  token: 'mock-jwt-token'
}

export const mockSnippets = [
  {
    id: '1',
    text: 'First snippet text',
    summary: 'First snippet summary',
    createdAt: '2025-08-08T06:41:13.000Z',
    updatedAt: '2025-08-08T06:41:13.000Z'
  },
  {
    id: '2',
    text: 'Second snippet text',
    summary: 'Second snippet summary',
    createdAt: '2025-08-08T06:42:13.000Z',
    updatedAt: '2025-08-08T06:42:13.000Z'
  }
]
