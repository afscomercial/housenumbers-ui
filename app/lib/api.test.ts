import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from './api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const mockResponse = {
        token: 'mock-jwt-token',
        expiresIn: '24h'
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })

      const credentials = {
        username: 'admin',
        password: 'password'
      }

      // Act
      const result = await apiClient.login(credentials)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(credentials)
        })
      )
    })

    it('should throw error for invalid credentials', async () => {
      // Arrange
      const errorResponse = {
        error: {
          message: 'Invalid credentials',
          code: 'UNAUTHORIZED',
          statusCode: 401
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify(errorResponse))
      })

      const credentials = {
        username: 'admin',
        password: 'wrong-password'
      }

      // Act & Assert
      await expect(apiClient.login(credentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('createSnippet', () => {
    const mockToken = 'mock-jwt-token'
    const mockSnippetData = { text: 'This is a test snippet for AI summarization.' }

    it('should successfully create a snippet', async () => {
      // Arrange
      const mockResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        text: mockSnippetData.text,
        summary: 'This is a test snippet for AI summarization.',
        createdAt: '2025-08-08T06:41:13.000Z',
        updatedAt: '2025-08-08T06:41:13.000Z'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })

      // Act
      const result = await apiClient.createSnippet(mockSnippetData, mockToken)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/snippets',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          }),
          body: JSON.stringify({ text: mockSnippetData.text })
        })
      )
    })

    it('should throw error when text is missing', async () => {
      // Arrange
      const errorResponse = {
        error: {
          message: 'Text is required',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve(JSON.stringify(errorResponse))
      })

      // Act & Assert
      await expect(apiClient.createSnippet({ text: '' }, mockToken)).rejects.toThrow('Text is required')
    })

    it('should throw error when token is invalid', async () => {
      // Arrange
      const errorResponse = {
        error: {
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
          statusCode: 401
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve(JSON.stringify(errorResponse))
      })

      // Act & Assert
      await expect(apiClient.createSnippet(mockSnippetData, 'invalid-token')).rejects.toThrow('Invalid or expired token')
    })
  })

  describe('getSnippets', () => {
    const mockToken = 'mock-jwt-token'

    it('should successfully retrieve all snippets', async () => {
      // Arrange
      const mockResponse = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          text: 'First snippet',
          summary: 'First summary',
          createdAt: '2025-08-08T06:41:13.000Z',
          updatedAt: '2025-08-08T06:41:13.000Z'
        },
        {
          id: '456e7890-e89b-12d3-a456-426614174001',
          text: 'Second snippet',
          summary: 'Second summary',
          createdAt: '2025-08-08T06:42:13.000Z',
          updatedAt: '2025-08-08T06:42:13.000Z'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      })

      // Act
      const result = await apiClient.getSnippets(mockToken)

      // Assert
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/snippets',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      )
    })

    it('should return empty array when no snippets exist', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify([]))
      })

      // Act
      const result = await apiClient.getSnippets(mockToken)

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('deleteSnippet', () => {
    const mockToken = 'mock-jwt-token'
    const snippetId = '123e4567-e89b-12d3-a456-426614174000'

    it('should successfully delete a snippet', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      // Act
      await apiClient.deleteSnippet(snippetId, mockToken)

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:3000/snippets/${snippetId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`
          })
        })
      )
    })

    it('should throw error when snippet not found', async () => {
      // Arrange
      const errorResponse = { error: 'Snippet not found' }
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify(errorResponse)),
        json: () => Promise.resolve(errorResponse)
      } as Response)

      // Act & Assert
      await expect(apiClient.deleteSnippet('non-existent-id', 'valid-token'))
        .rejects.toThrow('Snippet not found')
    })
  })
})
