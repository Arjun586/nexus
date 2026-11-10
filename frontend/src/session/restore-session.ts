import { getAccessToken } from "./access-token";
import { hasValidAccessToken, refreshSession } from "./session";
import { getUser } from "./user";

export { clearSession } from "./session";

export async function restoreSession(): Promise<boolean> {
  // On a soft reload the in-memory session may still be valid.
  if (getAccessToken() && hasValidAccessToken()) {
    return Boolean(getUser());
  }

  // Otherwise exchange the httpOnly refresh cookie for a fresh session.
  // `silent` keeps boot failures from dispatching the expiry event before
  // the router mounts.
  const accessToken = await refreshSession(true);

  return Boolean(accessToken && getUser());
}
