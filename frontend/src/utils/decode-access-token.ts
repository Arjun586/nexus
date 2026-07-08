type AccessTokenPayload = {
  userId: string;
  email: string;
};

export function decodeAccessToken(token: string): AccessTokenPayload | null {
  try {
    const segment = token.split(".")[1];

    if (!segment) {
      return null;
    }

    const payload = JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/")));

    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
      };
    }

    return null;
  } catch {
    return null;
  }
}
