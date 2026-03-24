export async function apiFetch(path, options = {}) {
  const base = 'http://localhost:9090';
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(base + path, { ...options, headers });

  if (res.status === 401) {
    // token invalid/expired - clear and redirect
    localStorage.removeItem('token');
    // don't import navigate here; let caller handle redirect
    const err = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = (body && (body.message || body.error)) || (typeof body === 'string' ? body : null) || res.statusText || 'Server error';
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return body;
}
