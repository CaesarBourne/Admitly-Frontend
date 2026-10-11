"use server";

import { revalidatePath } from "next/cache";
import { parseApiError } from "@/lib/api-client";
import { apiFetch } from "@/lib/api-server";
import type { ActionState } from "@/lib/actions/auth";
import type { EventDto } from "@/lib/types";

export async function getEventsAction(): Promise<EventDto[]> {
  const res = await apiFetch("/events");
  if (!res.ok) return [];
  return (await res.json()) as EventDto[];
}

export async function getEventAction(eventId: string): Promise<EventDto | null> {
  const res = await apiFetch(`/events/${eventId}`);
  if (!res.ok) return null;
  return (await res.json()) as EventDto;
}

export async function createEventAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  if (!name) return { error: "Event name is required." };

  const res = await apiFetch("/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, eventDate: eventDate || undefined }),
  });
  if (!res.ok) {
    const err = await parseApiError(res, "Could not create event.");
    return { error: err.message };
  }
  revalidatePath("/admin");
  return {};
}
