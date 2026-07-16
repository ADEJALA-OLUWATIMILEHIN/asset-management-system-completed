import type { ApiUser } from "./Getusers";
import { getAuthToken } from "./LoginApi/LoginApi";

type ApiResult<T> = {
  message: string;
  data: T | null;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  initials: string;
  role: ApiUser["role"];
  department_id: number | null;
  status?: ApiUser["status"];
  avatar_url?: string | null;
  two_fa_enabled?: boolean;
  security_clearance?: string | null;
  password?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3005";

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const body = await res.json();
    return typeof body?.error === "string" ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export const createUser = async (
  payload: CreateUserPayload
): Promise<ApiResult<{ user: ApiUser }>> => {
  try {
    const res = await fetch(`${apiBaseUrl}/user/new-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken() ?? ""}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return {
        message: await readErrorMessage(res, "Could not create this user"),
        data: null,
      };
    }

    const data = await res.json();

    return { message: "success", data };
  } catch (error) {
    console.error(error);
    return { message: "An error occurred. Try again later", data: null };
  }
};
