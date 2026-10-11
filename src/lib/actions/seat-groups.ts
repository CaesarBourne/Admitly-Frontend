"use server";

import { revalidatePath } from "next/cache";
import { parseApiError } from "@/lib/api-client";
import { apiFetch } from "@/lib/api-server";
import type { ActionState } from "@/lib/actions/auth";
import type { SeatGroupDto } from "@/lib/types";

export async function getSeatGroupsAction(eventId: string): Promise<SeatGroupDto[]> {
  const res = await apiFetch(`/events/${eventId}/seat-groups`);
  if (!res.ok) return [];
  return (await res.json()) as SeatGroupDto[];
}

export async function createSeatGroupAction(
  eventId: string,
  name: string,
  maxSize?: number,
): Promise<ActionState> {
  const res = await apiFetch(`/events/${eventId}/seat-groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, maxSize }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not create seat group.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}

export async function deleteSeatGroupAction(eventId: string, id: string): Promise<ActionState> {
  const res = await apiFetch(`/seat-groups/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not delete seat group.");
    return { error: err.message };
  }
  revalidatePath(`/admin/events/${eventId}`);
  return {};
}
