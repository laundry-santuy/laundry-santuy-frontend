function buildBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw || raw.trim() === '') return 'http://localhost:5000';
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // Jika tidak ada protokol, paksa https:// supaya tidak jadi relative path
  return `https://${trimmed}`;
}

export const BASE_URL = buildBaseUrl();

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    cache: options?.cache ?? 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  // Try to parse JSON when the response indicates JSON, otherwise read text
  let body: any = null;
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    body = await res.json().catch((e) => ({ error: `Invalid JSON response: ${String(e)}` }));
  } else {
    // Fallback: try to read text (useful when server returns plain error HTML/text)
    const text = await res.text().catch(() => '');
    // If text looks like JSON, try to parse
    try {
      body = text ? JSON.parse(text) : null;
    } catch (_) {
      body = { error: text || 'Terjadi kesalahan pada server' };
    }
  }

  if (!res.ok) {
    const errMsg = (body && body.error) ? String(body.error) : `HTTP ${res.status}`;

    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }

    throw new ApiError(res.status, errMsg);
  }

  return body as T;
}

export const apiClient = {
  get:   <T>(path: string)                => apiFetch<T>(path),
  post:  <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:   <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  del:   <T>(path: string)                => apiFetch<T>(path, { method: 'DELETE' }),
};