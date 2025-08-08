import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from './login'

// Mock Remix hooks
const mockUseActionData = vi.fn()

vi.mock('@remix-run/react', () => ({
  useActionData: () => mockUseActionData(),
  Form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => 
    <form {...props}>{children}</form>
}))

// Mock auth server
vi.mock('~/lib/auth.server', () => ({
  getUser: vi.fn(),
  createUserSession: vi.fn()
}))

// Mock API client
vi.mock('~/lib/api', () => ({
  apiClient: {
    login: vi.fn()
  }
}))

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseActionData.mockReturnValue(null)
  })

  it('renders login form with default elements', () => {
    render(<Login />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your summaries')).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Use custom credentials')).toBeInTheDocument()
  })

  it('displays error message when action returns error', () => {
    mockUseActionData.mockReturnValue({ error: 'Invalid username or password' })
    
    render(<Login />)
    
    expect(screen.getByText('Invalid username or password')).toBeInTheDocument()
    const errorDiv = screen.getByText('Invalid username or password').closest('div')
    expect(errorDiv).toHaveClass('bg-red-50')
  })

  it('shows default credentials by default', () => {
    render(<Login />)
    
    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    
    expect(usernameInput.value).toBe('admin')
    expect(passwordInput.value).toBe('password')
    expect(usernameInput.readOnly).toBe(true)
    expect(passwordInput.readOnly).toBe(true)
  })

  it('enables custom credentials when checkbox is checked', () => {
    render(<Login />)
    
    const checkbox = screen.getByLabelText('Use custom credentials')
    const usernameInput = screen.getByLabelText('Username') as HTMLInputElement
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    
    fireEvent.click(checkbox)
    
    expect(usernameInput.readOnly).toBe(false)
    expect(passwordInput.readOnly).toBe(false)
  })

  it('shows default credentials info box', () => {
    render(<Login />)
    
    expect(screen.getByText('Default credentials:')).toBeInTheDocument()
    expect(screen.getByText(/Username:\s*admin/)).toBeInTheDocument()
    expect(screen.getByText(/Password:\s*password/)).toBeInTheDocument()
  })

  it('renders submit button', () => {
    render(<Login />)
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('has proper form structure', () => {
    render(<Login />)
    
    const form = screen.getByText('Sign In').closest('form')
    expect(form).toHaveAttribute('method', 'post')
  })
})
