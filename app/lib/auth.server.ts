import { createCookieSessionStorage, redirect } from '@remix-run/node';

export interface User {
  username: string;
  token: string;
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__housenumbers_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [process.env.SESSION_SECRET || 'default-secret'],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
});

export async function createUserSession(user: User, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('user', user);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie')
  );
  return session;
}

export async function getUser(request: Request): Promise<User | null> {
  const session = await getUserSession(request);
  const user = session.get('user');
  if (!user) return null;
  return user;
}

export async function requireUser(request: Request): Promise<User> {
  const user = await getUser(request);
  if (!user) {
    throw redirect('/login');
  }
  return user;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}