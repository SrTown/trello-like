const TOKEN_KEY = "flowboard.token"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ||
  "https://trello-like-backend.vercel.app"

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore storage errors
  }
}

type ReqInit = Omit<RequestInit, "body" | "method" | "headers" | "credentials"> & {
  headers?: Record<string, string>
}

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  opts?: ReqInit
): Promise<T> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts?.headers || {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include", // to receive/send cookies if backend sets them
    ...opts,
  })
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    // non-JSON responses
    return text as unknown as T
  }
}

export const apiGet = <T>(path: string, opts?: ReqInit) => request<T>("GET", path, undefined, opts)
export const apiPost = <T>(path: string, body?: unknown, opts?: ReqInit) => request<T>("POST", path, body, opts)
export const apiPatch = <T>(path: string, body?: unknown, opts?: ReqInit) => request<T>("PATCH", path, body, opts)
export const apiDelete = <T>(path: string, body?: unknown, opts?: ReqInit) => request<T>("DELETE", path, body, opts)

// Safe JWT decoder (no external deps)
export function decodeJwt<T = unknown>(token?: string | null): T | undefined {
  if (!token) return undefined
  try {
    const [, payload] = token.split(".")
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(json) as T
  } catch {
    return undefined
  }
}