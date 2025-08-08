import { useState } from 'react';
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useSubmit, useFetcher, useRevalidator } from '@remix-run/react';
import { requireUser, logout } from '~/lib/auth.server';
import { apiClient, type Snippet } from '~/lib/api';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  
  try {
    const snippets = await apiClient.getSnippets(user.token);
    return json({ user, snippets });
  } catch (error) {
    console.error('Failed to load snippets:', error);
    return json({ user, snippets: [] });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'logout') {
    return logout(request);
  }

  if (intent === 'create') {
    const text = formData.get('text') as string;
    
    if (!text?.trim()) {
      return json({ error: 'Text is required' }, { status: 400 });
    }

    try {
      await apiClient.createSnippet({ text: text.trim() }, user.token);
      return json({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create summary';
      return json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  }

  if (intent === 'delete') {
    const id = formData.get('id') as string;
    
    try {
      await apiClient.deleteSnippet(id, user.token);
      return json({ success: true });
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : 'Failed to delete snippet' },
        { status: 500 }
      );
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function Dashboard() {
  const { user, snippets } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const deleteFetcher = useFetcher();
  const revalidator = useRevalidator();
  
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [text, setText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectSnippet = (snippet: Snippet) => {
    setSelectedSnippet(snippet);
    setText(snippet.text);
  };

  const handleNewSnippet = () => {
    setSelectedSnippet(null);
    setText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData();
    formData.append('intent', 'create');
    formData.append('text', text);
    submit(formData, { method: 'post' });
    
    setTimeout(() => {
      setIsCreating(false);
      if (!('error' in (actionData ?? {}))) {
        setText('');
        setSelectedSnippet(null);
        revalidator.revalidate();
      }
    }, 1000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this snippet?')) {
      const formData = new FormData();
      formData.append('intent', 'delete');
      formData.append('id', id);
      deleteFetcher.submit(formData, { method: 'post' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Summarizer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}</span>
              <Form method="post">
                <input type="hidden" name="intent" value="logout" />
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedSnippet ? 'Edit Summary' : 'Create New Summary'}
                </h2>
                {selectedSnippet && (
                  <button
                    onClick={handleNewSnippet}
                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    New Summary
                  </button>
                )}
              </div>

              {actionData && 'error' in actionData && actionData.error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{actionData.error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                    Text to Summarize
                  </label>
                  <textarea
                    id="text"
                    name="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Paste your text here and get an AI-generated summary..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!text.trim() || isCreating}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Generating Summary...' : 'Generate Summary'}
                </button>
              </form>

              {selectedSnippet && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">AI Summary</h3>
                  <p className="text-blue-800">{selectedSnippet.summary}</p>
                  <p className="text-blue-600 text-xs mt-2">
                    Created: {new Date(selectedSnippet.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Previous Summaries */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Previous Summaries</h2>
              
              {snippets.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No summaries yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {snippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:border-blue-300 ${
                        selectedSnippet?.id === snippet.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <button
                          onClick={() => handleSelectSnippet(snippet)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {snippet.summary}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(snippet.createdAt).toLocaleDateString()}
                          </p>
                        </button>
                        <button
                          onClick={() => handleDelete(snippet.id)}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete snippet"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}