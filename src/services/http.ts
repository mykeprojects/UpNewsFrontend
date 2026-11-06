const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type QueryValue = string | number | undefined | null;

/** GET al backend de UP News. Lanza ApiError con el mensaje que envía el backend ({ error }). */
export async function apiGet<T>(path: string, query: Record<string, QueryValue> = {}, signal?: AbortSignal): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'No se pudo conectar con el servidor de noticias');
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, (body as { error?: string } | null)?.error ?? 'Error al consultar las noticias');
  }
  return body as T;
}
