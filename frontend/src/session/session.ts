import axios from "axios";

import type { RefreshResponse, SafeUser } from "../types/auth";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./access-token";
import { clearUser, getUser, setUser } from "./user";

export const SESSION_EXPIRED_EVENT = "nexus-session-expired";

const API_BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

/** Never schedule the proactive refresh more than a minute ahead. */
const MAX_REFRESH_LEEWAY_MS = 60_000;

/** Treat a token that expires within this window as unusable. */
const TOKEN_EXPIRY_GRACE_MS = 5_000;

const MIN_REFRESH_DELAY_MS = 1_000;

/** Default 15 minutes in seconds when backend does not send expiresIn */
const DEFAULT_ACCESS_TOKEN_LIFETIME_SEC = 15 * 60;

type SessionInput = {
  accessToken: string;
  user?: SafeUser | null;
  expiresIn?: number;
};

let expiresAt = 0;
let refreshTimer: number | null = null;
let refreshPromise: Promise<string | null> | null = null;
let sessionGeneration = 0;

const hasSessionState = (): boolean => Boolean(getUser() || getAccessToken());

const emitSessionExpired = (): void => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
};

const cancelRefreshTimer = (): void => {
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

const sanitizeExpiresIn = (expiresIn?: number): number => {
  if (typeof expiresIn === "number" && Number.isFinite(expiresIn) && expiresIn > 0) {
    return expiresIn;
  }
  return DEFAULT_ACCESS_TOKEN_LIFETIME_SEC;
};

const getRefreshDelayMs = (expiresIn?: number): number => {
  const safeSeconds = sanitizeExpiresIn(expiresIn);
  const lifetimeMs = safeSeconds * 1000;
  const leeway = Math.min(MAX_REFRESH_LEEWAY_MS, lifetimeMs * 0.2);
  return Math.max(lifetimeMs - leeway, MIN_REFRESH_DELAY_MS);
};

const scheduleRefresh = (expiresIn?: number): void => {
  cancelRefreshTimer();

  const delayMs = getRefreshDelayMs(expiresIn);
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    void refreshSession();
  }, delayMs);
};

const getUserFromTokenFallback = (token: string): SafeUser | null => {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const payload = JSON.parse(
      atob(segment.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (typeof payload?.userId === "string") {
      return {
        id: payload.userId,
        email: payload.email || "",
        name: payload.name || payload.email?.split("@")[0] || "User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const setSession = ({
  accessToken,
  user,
  expiresIn,
}: SessionInput): void => {
  sessionGeneration += 1;
  const safeExpiresIn = sanitizeExpiresIn(expiresIn);
  setAccessToken(accessToken);

  if (user) {
    setUser(user);
  } else if (!getUser()) {
    const fallbackUser = getUserFromTokenFallback(accessToken);
    if (fallbackUser) {
      setUser(fallbackUser);
    }
  }

  expiresAt = Date.now() + safeExpiresIn * 1000;
  scheduleRefresh(safeExpiresIn);
};

export const clearSession = (): void => {
  sessionGeneration += 1;
  cancelRefreshTimer();
  refreshPromise = null;
  clearAccessToken();
  clearUser();
  expiresAt = 0;
};

export const hasValidAccessToken = (): boolean => {
  return Boolean(getAccessToken()) && Date.now() < expiresAt - TOKEN_EXPIRY_GRACE_MS;
};

/**
 * Refreshes the access token using the httpOnly refresh-token cookie.
 *
 * Concurrent callers share a single in-flight request. On failure the local
 * session is cleared only on explicit 401/403 authorization rejections.
 */
export const refreshSession = (silent = false): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  if (!silent && !hasSessionState()) {
    return Promise.resolve(null);
  }

  const generation = sessionGeneration;

  const request = (async (): Promise<string | null> => {
    try {
      const response = await axios.post<RefreshResponse>(
        `${API_BASE_URL}/auth/refresh`,
        null,
        { withCredentials: true },
      );

      if (generation !== sessionGeneration) {
        return getAccessToken();
      }

      const rawData = response.data?.data;
      const accessToken = rawData?.accessToken;
      const user = rawData?.user;
      const expiresIn = rawData?.expiresIn;

      if (!accessToken) {
        throw new Error("Missing access token in refresh response");
      }

      setSession({ accessToken, user, expiresIn });

      return accessToken;
    } catch (error: any) {
      const status = error?.response?.status;
      const isAuthRejection = status === 401 || status === 403;

      if (generation === sessionGeneration) {
        if (isAuthRejection) {
          clearSession();

          if (!silent) {
            emitSessionExpired();
          }
        } else if (status === 429) {
          // If rate limited, back off and retry after cooldown rather than looping or logging out
          console.warn("Refresh rate limited (429). Will retry after cooldown.");
          scheduleRefresh(60);
        }
      }

      return null;
    }
  })();

  let tracked: Promise<string | null>;

  tracked = request.finally(() => {
    if (refreshPromise === tracked) {
      refreshPromise = null;
    }
  });

  refreshPromise = tracked;

  return tracked;
};

/**
 * Returns a usable access token, refreshing it when it is missing or about to
 * expire. Used by the axios interceptor and the WebSocket token callback.
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  if (hasValidAccessToken()) {
    return getAccessToken();
  }

  if (!hasSessionState()) {
    return null;
  }

  return refreshSession();
};

// Recover gracefully after the machine sleeps or the network drops: if the
// session exists but the token has lapsed, refresh as soon as we are back.
const refreshIfNeeded = (): void => {
  if (getUser() && !hasValidAccessToken()) {
    void refreshSession();
  }
};

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshIfNeeded();
    }
  });

  window.addEventListener("online", refreshIfNeeded);
}
