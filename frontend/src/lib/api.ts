const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiClient(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !window.location.pathname.startsWith('/login')) {
    window.dispatchEvent(new Event('auth-unauthorized'));
  }

  return response;
}
