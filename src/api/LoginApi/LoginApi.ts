export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoggedInUser = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "VIEWER";
  initials: string;
  department: { id: number; name: string } | null;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: LoggedInUser;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3005";

/** Authenticates with POST /login and saves the resulting session for API calls. */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${apiBaseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message ?? body.error ?? "Unable to sign in. Please try again.");
  }

  const result = body as LoginResponse;
  // Every successful login gets a fresh view of overdue reminders, even on a shared browser.
  sessionStorage.removeItem(`alms.shown-reminders.${result.user.id}`);
  localStorage.setItem("alms.auth.token", result.token);
  localStorage.setItem("alms.auth.user", JSON.stringify(result.user));
  return result;
}

export function logout() {
  localStorage.removeItem("alms.auth.token");
  localStorage.removeItem("alms.auth.user");
}

export function getAuthToken() {
  return localStorage.getItem("alms.auth.token");
}

export function getCurrentUser(): LoggedInUser | null {
  try {
    const value = localStorage.getItem("alms.auth.user");
    return value ? (JSON.parse(value) as LoggedInUser) : null;
  } catch {
    return null;
  }
}
