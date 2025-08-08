import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dashboard from './dashboard'
import { mockSnippets } from '../test-utils'

// Mock Remix hooks
const mockSubmit = vi.fn()
const mockRevalidator = { revalidate: vi.fn() }
const mockFetcher = {
  submit: vi.fn(),
  state: 'idle'
}

const mockUseLoaderData = vi.fn()
const mockUseActionData = vi.fn()

vi.mock('@remix-run/react', () => ({
  useLoaderData: () => mockUseLoaderData(),
  useActionData: () => mockUseActionData(),
  useSubmit: () => mockSubmit,
  useFetcher: () => mockFetcher,
  useRevalidator: () => mockRevalidator,
  Form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => 
    <form {...props}>{children}</form>
}))

// Mock auth server
vi.mock('~/lib/auth.server', () => ({
  requireUser: vi.fn(),
  logout: vi.fn()
}))

// Mock API client
vi.mock('~/lib/api', () => ({
  apiClient: {
    getSnippets: vi.fn(),
    createSnippet: vi.fn(),
    deleteSnippet: vi.fn()
  }
}))

describe('Dashboard Component', () => {
  const mockUser = { username: 'admin', token: 'mock-token' }

  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock return values
    mockUseLoaderData.mockReturnValue({ 
      user: mockUser, 
      snippets: mockSnippets 
    })
    mockUseActionData.mockReturnValue(null)
  })

  it('renders dashboard header with user welcome message', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('AI Summarizer')).toBeInTheDocument()
    expect(screen.getByText('Welcome, admin')).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('renders create new summary form', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Create New Summary')).toBeInTheDocument()
    expect(screen.getByLabelText('Text to Summarize')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste your text here and get an AI-generated summary...')).toBeInTheDocument()
    expect(screen.getByText('Generate Summary')).toBeInTheDocument()
  })

  it('displays previous summaries in sidebar', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Previous Summaries')).toBeInTheDocument()
    expect(screen.getByText('First snippet summary')).toBeInTheDocument()
    expect(screen.getByText('Second snippet summary')).toBeInTheDocument()
  })

  it('shows empty state when no snippets exist', () => {
    mockUseLoaderData.mockReturnValue({ 
      user: mockUser, 
      snippets: [] 
    })
    
    render(<Dashboard />)
    
    expect(screen.getByText('No summaries yet')).toBeInTheDocument()
  })

  it('handles text input changes', () => {
    render(<Dashboard />)
    
    const textarea = screen.getByLabelText('Text to Summarize')
    fireEvent.change(textarea, { target: { value: 'Test text input' } })
    
    expect(textarea).toHaveValue('Test text input')
  })

  it('submits form with correct data', () => {
    render(<Dashboard />)
    
    const textarea = screen.getByLabelText('Text to Summarize')
    const submitButton = screen.getByText('Generate Summary')
    
    fireEvent.change(textarea, { target: { value: 'Test text to summarize' } })
    fireEvent.click(submitButton)
    
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.any(FormData),
      { method: 'post' }
    )
  })

  it('disables submit button when text is empty', () => {
    render(<Dashboard />)
    
    const submitButton = screen.getByText('Generate Summary')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when text is provided', () => {
    render(<Dashboard />)
    
    const textarea = screen.getByLabelText('Text to Summarize')
    const submitButton = screen.getByText('Generate Summary')
    
    fireEvent.change(textarea, { target: { value: 'Some text' } })
    
    expect(submitButton).not.toBeDisabled()
  })

  it('displays error message when action returns error', () => {
    mockUseActionData.mockReturnValue({ error: 'Text is required' })
    
    render(<Dashboard />)
    
    expect(screen.getByText('Text is required')).toBeInTheDocument()
    const errorDiv = screen.getByText('Text is required').closest('div')
    expect(errorDiv).toHaveClass('bg-red-50')
  })

  it('allows selecting a snippet to edit', () => {
    render(<Dashboard />)
    
    const firstSnippet = screen.getByText('First snippet summary')
    fireEvent.click(firstSnippet)
    
    expect(screen.getByText('Edit Summary')).toBeInTheDocument()
    expect(screen.getByText('New Summary')).toBeInTheDocument()
    
    const textarea = screen.getByLabelText('Text to Summarize')
    expect(textarea).toHaveValue('First snippet text')
  })

  it('shows snippet summary when editing', () => {
    render(<Dashboard />)
    
    const firstSnippet = screen.getByText('First snippet summary')
    fireEvent.click(firstSnippet)
    
    expect(screen.getByText('AI Summary')).toBeInTheDocument()
    // Use getAllByText since "First snippet summary" appears both in sidebar and summary
    expect(screen.getAllByText('First snippet summary')).toHaveLength(2)
    expect(screen.getByText(/Created:/)).toBeInTheDocument()
  })

  it('allows creating new summary after selecting existing one', () => {
    render(<Dashboard />)
    
    // Select existing snippet
    const firstSnippet = screen.getByText('First snippet summary')
    fireEvent.click(firstSnippet)
    
    // Click new summary button
    const newSummaryButton = screen.getByText('New Summary')
    fireEvent.click(newSummaryButton)
    
    expect(screen.getByText('Create New Summary')).toBeInTheDocument()
    expect(screen.queryByText('Edit Summary')).not.toBeInTheDocument()
    
    const textarea = screen.getByLabelText('Text to Summarize')
    expect(textarea).toHaveValue('')
  })

  it('handles delete snippet confirmation', () => {
    // Mock window.confirm
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    
    render(<Dashboard />)
    
    const deleteButtons = screen.getAllByTitle('Delete snippet')
    fireEvent.click(deleteButtons[0])
    
    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this snippet?')
    expect(mockFetcher.submit).toHaveBeenCalledWith(
      expect.any(FormData),
      { method: 'post' }
    )
    
    mockConfirm.mockRestore()
  })

  it('cancels delete when user declines confirmation', () => {
    // Mock window.confirm to return false
    const mockConfirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    
    render(<Dashboard />)
    
    const deleteButtons = screen.getAllByTitle('Delete snippet')
    fireEvent.click(deleteButtons[0])
    
    expect(mockConfirm).toHaveBeenCalled()
    expect(mockFetcher.submit).not.toHaveBeenCalled()
    
    mockConfirm.mockRestore()
  })

  it('highlights selected snippet in sidebar', () => {
    render(<Dashboard />)
    
    const firstSnippet = screen.getByText('First snippet summary')
    fireEvent.click(firstSnippet)
    
    // Find the snippet container (the div with the classes)
    const snippetContainer = firstSnippet.closest('.p-4')
    expect(snippetContainer).toHaveClass('border-blue-500', 'bg-blue-50')
  })

  it('shows loading state during form submission', async () => {
    render(<Dashboard />)
    
    const textarea = screen.getByLabelText('Text to Summarize')
    const submitButton = screen.getByText('Generate Summary')
    
    fireEvent.change(textarea, { target: { value: 'Test text' } })
    fireEvent.click(submitButton)
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Generating Summary...')).toBeInTheDocument()
    })
  })

  it('displays formatted creation dates for snippets', () => {
    render(<Dashboard />)
    
    // Check for date formatting (the mockSnippets have dates from Aug 8, 2025)
    const dateElements = screen.getAllByText(/8\/8\/2025|Aug 8, 2025/)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('renders sign out form correctly', () => {
    render(<Dashboard />)
    
    const signOutButton = screen.getByText('Sign Out')
    const form = signOutButton.closest('form')
    
    expect(form).toBeInTheDocument()
    expect(form?.querySelector('input[name="intent"][value="logout"]')).toBeInTheDocument()
  })

  it('maintains responsive grid layout', () => {
    render(<Dashboard />)
    
    const gridContainer = screen.getByText('Create New Summary').closest('.grid')
    expect(gridContainer).toHaveClass('grid-cols-1', 'lg:grid-cols-3')
  })
})
