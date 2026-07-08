import type { SafeUser } from "../types/auth";

let user: SafeUser | null = null;

export function setUser(nextUser: SafeUser): void {
  user = nextUser;
}

export function getUser(): SafeUser | null {
  return user;
}

export function clearUser(): void {
  user = null;
}
