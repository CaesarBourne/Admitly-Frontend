"use server";

import { revalidatePath } from "next/cache";
import { parseApiError } from "@/lib/api-client";
import { apiFetch } from "@/lib/api-server";
import type { ActionState } from "@/lib/actions/auth";
import type { InviteeDto } from "@/lib/types";

export async function getInviteesAction(eventId: string): Promise<InviteeDto[]> {
  const res = await apiFetch(`/events/${eventId}/invitees`);
  if (!res.ok) return [];
  return (await res.json()) as InviteeDto[];
}

export async function createInviteeAction(
  eventId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const res = await apiFetch(`/events/${eventId}/invitees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not create invitee.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function deleteInviteeAction(eventId: string, inviteeId: string): Promise<ActionState> {
  const res = await apiFetch(`/invitees/${inviteeId}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not remove invitee.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function setSeatNumberAction(
  eventId: string,
  inviteeId: string,
  seatNumber: string | null,
): Promise<ActionState> {
  const res = await apiFetch(`/invitees/${inviteeId}/seat`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seatNumber }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not update seat number.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function setSeatGroupAction(
  eventId: string,
  inviteeId: string,
  seatGroupId: string | null,
): Promise<ActionState> {
  const res = await apiFetch(`/invitees/${inviteeId}/seat-group`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seatGroupId }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not update group.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function setInactiveAction(
  eventId: string,
  inviteeId: string,
  inactive: boolean,
): Promise<ActionState> {
  const res = await apiFetch(`/invitees/${inviteeId}/inactive`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inactive }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not update invitee.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function admitInviteeAction(
  inviteeId: string,
): Promise<{ admissionStatus: string; admittedAt: string | null } | { error: string }> {
  const res = await apiFetch(`/invitees/${inviteeId}/admit`, { method: "POST" });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not admit invitee.");
    return { error: err.message };
  }
  return (await res.json()) as { admissionStatus: string; admittedAt: string | null };
}

export async function uploadInviteeAvatarAction(
  eventId: string,
  inviteeId: string,
  formData: FormData,
): Promise<ActionState> {
  const res = await apiFetch(`/invitees/${inviteeId}/avatar`, { method: "POST", body: formData });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not upload photo.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

/** Looks up an invitee by their QR token without creating a session — used by the scan flow. */
export async function getInviteeByTokenAction(
  token: string,
): Promise<{ inviteeId: string; eventId: string; name: string } | { error: string }> {
  const res = await apiFetch("/auth/invitee-info", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Invitee not found or QR code is invalid.");
    return { error: err.message };
  }
  const data = (await res.json()) as { id: string; eventId: string; name?: string };
  return { inviteeId: data.id, eventId: data.eventId, name: data.name ?? "Invitee" };
}
