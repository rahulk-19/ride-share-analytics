const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.statusText}`);
  return res.json();
}