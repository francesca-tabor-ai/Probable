/** Auth API - sign up, log in, current user. */

const AUTH_BASE = "/api/v1/auth";
const TOKEN_KEY = "probable_token";

/** Get the stored token for API requests. */
export function getAuthToken(): string | null {
  return typeof localStorage !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Fetch with Bearer token. Use for API calls that need auth. */
export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, credentials: "include", headers });
}

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function signUp(input: SignUpInput): Promise<User> {
  const res = await fetch(`${AUTH_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      full_name: input.full_name ?? null,
    }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Sign up failed: ${res.status}`);
  }
  return res.json();
}

export async function login(input: LoginInput): Promise<TokenResponse> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Login failed: ${res.status}`);
  }
  return res.json();
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${AUTH_BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    throw new Error(`Failed to fetch user: ${res.status}`);
  }
  return res.json();
}
