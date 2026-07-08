import { clearAccessToken, getAccessToken, setAccessToken } from "./access-token";
import { clearUser, getUser, setUser } from "./user";
import { refresh } from "../api/auth";
import type { SafeUser } from "../types/auth";
import { decodeAccessToken } from "../utils/decode-access-token";

const userFromAccessToken = (token: string): SafeUser | null => {
  const payload = decodeAccessToken(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    name: "",
    createdAt: "",
    updatedAt: "",
  };
};

export function clearSession(): void {
  clearAccessToken();
  clearUser();
}

export async function restoreSession(): Promise<boolean> {
  const existingToken = getAccessToken();

  if (existingToken) {
    if (!getUser()) {
      const user = userFromAccessToken(existingToken);

      if (user) {
        setUser(user);
      }
    }

    return Boolean(getAccessToken() && getUser());
  }

  try {
    const response = await refresh();
    const accessToken = response.data.accessToken;
    const user = userFromAccessToken(accessToken);

    if (!user) {
      clearSession();
      return false;
    }

    setAccessToken(accessToken);
    setUser(user);
    return true;
  } catch {
    clearSession();
    return false;
  }
}
