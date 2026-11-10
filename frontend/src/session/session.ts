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

type SessionInput = {
  accessToken: string;
  user: SafeUser;
  expiresIn: number;
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

const getRefreshDelayMs = (expiresIn: number): number => {
  const lifetimeMs = Math.max(expiresIn, 0) * 1000;
  const leeway = Math.min(MAX_REFRESH_LEEWAY_MS, lifetimeMs * 0.2);
  return Math.max(lifetimeMs - leeway, MIN_REFRESH_DELAY_MS);
};

const scheduleRefresh = (expiresIn: number): void => {
  cancelRefreshTimer();

  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    void refreshSession();
  }, getRefreshDelayMs(expiresIn));
};

export const setSession = ({
  accessToken,
  user,
  expiresIn,
}: SessionInput): void => {
  sessionGeneration += 1;
  setAccessToken(accessToken);
  setUser(user);
  expiresAt = Date.now() + expiresIn * 1000;
  scheduleRefresh(expiresIn);
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
 * session is cleared and `SESSION_EXPIRED_EVENT` is dispatched unless the
 * caller asked for a silent attempt (used during boot).
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

      const { accessToken, user, expiresIn } = response.data.data;

      setSession({ accessToken, user, expiresIn });

      return accessToken;
    } catch {
      if (generation === sessionGeneration) {
        clearSession();

        if (!silent) {
          emitSessionExpired();
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
