"use client";

import { useState } from "react";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { createSeatGroupAction, deleteSeatGroupAction } from "@/lib/actions/seat-groups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SeatGroupDto } from "@/lib/types";

const DEFAULT_MAX_SIZE = 8;

export function SeatGroupsPanel({
  eventId,
  seatGroups,
}: {
  readonly eventId: string;
  readonly seatGroups: SeatGroupDto[];
}) {
  const [name, setName] = useState("");
  const [maxSize, setMaxSize] = useState(String(DEFAULT_MAX_SIZE));
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    const size = Number(maxSize) || DEFAULT_MAX_SIZE;
    const result = await createSeatGroupAction(eventId, trimmed, size);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Seat group "${trimmed}" created.`);
      setName("");
      setMaxSize(String(DEFAULT_MAX_SIZE));
    }
    setCreating(false);
  }

  async function handleDelete(group: SeatGroupDto) {
    if (!confirm(`Delete seat group "${group.name}"? Invitees keep their seat number but lose this group.`)) return;
    setDeletingId(group.id);
    const result = await deleteSeatGroupAction(eventId, group.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Removed "${group.name}".`);
    }
    setDeletingId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Group invitees under a shared seat name (e.g. &quot;VIP Table 3&quot;) — set how many
        invitees each group holds.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seat group name"
          maxLength={40}
          className="max-w-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleCreate();
          }}
        />
        <Input
          value={maxSize}
          onChange={(e) => setMaxSize(e.target.value)}
          type="number"
          min={1}
          max={1000}
          placeholder="Max"
          className="w-20"
          title="Max invitees per group"
        />
        <Button type="button" onClick={() => void handleCreate()} disabled={creating || !name.trim()}>
          {creating ? <Loader2 className="animate-spin" /> : <Plus />}
          {creating ? "Creating…" : "Add seat group"}
        </Button>
      </div>

      {seatGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          {seatGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-3 rounded-lg border p-3">
              <Users className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate font-medium">{group.name}</span>
              <Badge variant={group.guestCount >= group.maxSize ? "default" : "secondary"}>
                {group.guestCount}/{group.maxSize}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void handleDelete(group)}
                disabled={deletingId === group.id}
                title="Delete seat group"
              >
                {deletingId === group.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
