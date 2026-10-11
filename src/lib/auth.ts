import { redirect } from "next/navigation";
import { apiFetch } from "./api-server";
import { getSessionToken } from "./session";
import type { AuthUser } from "./types";

/** Reads the session cookie and validates it against GET /auth/me. Server-only. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const res = await apiFetch("/auth/me");
  if (!res.ok) return null;

  const data = (await res.json()) as AuthUser & { sub: string };
  return { ...data, id: data.sub };
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.type === "admin";
}

export function isOwner(user: AuthUser | null): boolean {
  return user?.type === "admin" && user.role === "owner";
}

/** Redirects to /login if there is no authenticated admin session. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Redirects to /login if the current session isn't an org admin. */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/login");
  return user;
}

/** Redirects invitees to /welcome instead of /login — used by the invitee flow. */
export async function requireInvitee(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || user.type !== "invitee") redirect("/invite");
  return user;
}
