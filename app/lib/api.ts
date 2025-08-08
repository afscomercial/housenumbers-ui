const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
}

export interface Snippet {
  id: string;
  text: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSnippetRequest {
  text: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      method: 'GET', // default method
      ...options, // spread options first to override defaults
      headers: {
        'Content-Type': 'application/json',
        ...options.headers, // merge headers properly
      },
    };
    
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            errorData = JSON.parse(responseText);
            // Extract error message from various possible structures
            if (errorData.error) {
              if (typeof errorData.error === 'string') {
                errorMessage = errorData.error;
              } else if (errorData.error.message) {
                errorMessage = errorData.error.message;
              } else if (errorData.error.error) {
                errorMessage = errorData.error.error;
              } else {
                errorMessage = JSON.stringify(errorData.error);
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          } catch (parseError) {
            errorMessage = responseText;
          }
        }
      } catch (readError) {
        // Ignore read errors, use default message
      }
      
      throw new Error(errorMessage);
    }

    try {
      const responseText = await response.text();
      return responseText ? JSON.parse(responseText) : ({} as T);
    } catch (parseError) {
      throw new Error('Invalid JSON response');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async createSnippet(data: CreateSnippetRequest, token: string): Promise<Snippet> {
    const payload = { text: data.text };
    
    return this.request<Snippet>('/snippets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  }

  async getSnippets(token: string): Promise<Snippet[]> {
    return this.request<Snippet[]>('/snippets', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getSnippet(id: string, token: string): Promise<Snippet> {
    return this.request<Snippet>(`/snippets/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async deleteSnippet(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/snippets/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const responseText = await response.text();
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            errorMessage = responseText;
          }
        }
      } catch (readError) {
        console.error('Failed to read error response:', readError);
      }
      
      throw new Error(errorMessage);
    }
  }
}

export const apiClient = new ApiClient();