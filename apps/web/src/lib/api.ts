const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  fleetId: string;
  fleetName: string;
  tier: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sfms_token");
}

export function setSession(token: string, user: SessionUser) {
  localStorage.setItem("sfms_token", token);
  localStorage.setItem("sfms_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("sfms_token");
  localStorage.removeItem("sfms_user");
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sfms_user");
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function formatError(body: unknown, status: number): string {
  if (!body || typeof body !== "object") {
    return status === 401 ? "Session expired — sign in again" : "Request failed";
  }
  const err = (body as { error?: unknown }).error;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const flat = err as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    if (flat.formErrors?.[0]) return flat.formErrors[0];
    const firstField = Object.values(flat.fieldErrors ?? {})[0]?.[0];
    if (firstField) return firstField;
  }
  return "Request failed";
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error("Cannot reach API — is demo server on :3001?");
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearSession();
    }
    throw new Error(formatError(body, res.status));
  }
  return body as T;
}

export { API_URL };
