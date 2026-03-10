const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? '';

function buildUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const base = API_BASE_URL?.trim();
  if (!base) {
    return path;
  }

  if (base.endsWith('/') && path.startsWith('/')) {
    return base.slice(0, -1) + path;
  }

  if (!base.endsWith('/') && !path.startsWith('/')) {
    return `${base}/${path}`;
  }

  return base + path;
}

export interface FetchJsonOptions extends RequestInit {
  /** If true, will not throw on non-2xx responses and instead return the raw Response */
  rawResponse?: boolean;
}

export async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const { rawResponse, headers, ...rest } = options;

  const response = await fetch(buildUrl(path), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    ...rest,
  });

  if (rawResponse) {
    // @ts-expect-error caller expects Response when rawResponse=true
    return response;
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    let errorBody: unknown = undefined;
    if (isJson) {
      try {
        errorBody = await response.json();
      } catch {
        // ignore JSON parse errors
      }
    } else {
      try {
        errorBody = await response.text();
      } catch {
        // ignore text read errors
      }
    }

    const error = new Error(`Request failed with status ${response.status}`);
    (error as any).status = response.status;
    (error as any).body = errorBody;
    throw error;
  }

  if (!isJson) {
    // @ts-expect-error caller is responsible for type when response is not JSON
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}
