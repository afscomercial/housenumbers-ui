import { useState } from 'react';
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { apiClient } from '~/lib/api';
import { getUser, createUserSession } from '~/lib/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);
  if (user) {
    return redirect('/dashboard');
  }
  return json({ user: null });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return json(
      { error: 'Username and password are required' },
      { status: 400 }
    );
  }

  try {
    const authResponse = await apiClient.login({ username, password });
    return createUserSession(
      { username, token: authResponse.token },
      '/dashboard'
    );
  } catch (error) {
    return json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [useCustomCredentials, setUseCustomCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'password'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your summaries</p>
        </div>

        {actionData?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{actionData.error}</p>
          </div>
        )}

        <Form method="post" className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              defaultValue={useCustomCredentials ? credentials.username : 'admin'}
              onChange={(e) => useCustomCredentials && setCredentials({...credentials, username: e.target.value})}
              readOnly={!useCustomCredentials}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !useCustomCredentials ? 'bg-gray-50' : 'bg-white'
              }`}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              defaultValue={useCustomCredentials ? credentials.password : 'password'}
              onChange={(e) => useCustomCredentials && setCredentials({...credentials, password: e.target.value})}
              readOnly={!useCustomCredentials}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                !useCustomCredentials ? 'bg-gray-50' : 'bg-white'
              }`}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              id="custom-credentials"
              type="checkbox"
              checked={useCustomCredentials}
              onChange={(e) => setUseCustomCredentials(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="custom-credentials" className="ml-2 block text-sm text-gray-700">
              Use custom credentials
            </label>
          </div>

          {!useCustomCredentials && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">
                <strong>Default credentials:</strong><br />
                Username: admin<br />
                Password: password
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </button>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            AI-powered text summarization platform
          </p>
        </div>
      </div>
    </div>
  );
}