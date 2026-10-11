"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, MapPin, Trash2, Undo2, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import {
  deleteInviteeAction,
  setInactiveAction,
  setSeatGroupAction,
  setSeatNumberAction,
  uploadInviteeAvatarAction,
} from "@/lib/actions/invitees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCell } from "@/components/admin/QrCell";
import { clientEnv } from "@/lib/env-client";
import type { InviteeDto, SeatGroupDto } from "@/lib/types";

export function InviteeRow({
  eventId,
  invitee,
  seatGroups,
  displayNumber,
}: {
  readonly eventId: string;
  readonly invitee: InviteeDto;
  readonly seatGroups: SeatGroupDto[];
  readonly displayNumber: number;
}) {
  const [deleting, setDeleting] = useState(false);
  const [togglingInactive, setTogglingInactive] = useState(false);
  const [editingSeat, setEditingSeat] = useState(false);
  const [seatValue, setSeatValue] = useState(invitee.seatNumber ?? "");
  const [savingSeat, setSavingSeat] = useState(false);
  const [savingSeatGroup, setSavingSeatGroup] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSaveSeat() {
    setSavingSeat(true);
    const result = await setSeatNumberAction(eventId, invitee.id, seatValue.trim() || null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Seat updated for ${invitee.name}.`);
      setEditingSeat(false);
    }
    setSavingSeat(false);
  }

  async function handleSeatGroupChange(seatGroupId: string) {
    setSavingSeatGroup(true);
    const result = await setSeatGroupAction(eventId, invitee.id, seatGroupId || null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Seat group updated for ${invitee.name}.`);
    }
    setSavingSeatGroup(false);
  }

  async function handleToggleInactive() {
    setTogglingInactive(true);
    const next = !invitee.inactive;
    const result = await setInactiveAction(eventId, invitee.id, next);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(next ? `${invitee.name} marked inactive.` : `${invitee.name} moved back to the active list.`);
    }
    setTogglingInactive(false);
  }

  async function handleDelete() {
    if (!confirm(`Remove invitee "${invitee.name}"? This will invalidate their QR code.`)) return;
    setDeleting(true);
    const result = await deleteInviteeAction(eventId, invitee.id);
    if (result.error) {
      toast.error(result.error);
      setDeleting(false);
    } else {
      toast.success(`Removed ${invitee.name}.`);
    }
  }

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadInviteeAvatarAction(eventId, invitee.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Photo updated for ${invitee.name}.`);
    }
    setUploadingPhoto(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadingPhoto}
        title="Upload invitee photo"
        className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-medium"
      >
        {invitee.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${clientEnv.apiBaseUrl}${invitee.avatarUrl}`}
            alt={invitee.name}
            className="h-full w-full object-cover"
          />
        ) : uploadingPhoto ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Camera className="size-4 text-muted-foreground" />
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">#{displayNumber}</Badge>
          <span className="font-medium">{invitee.name || "—"}</span>
          {invitee.admissionStatus === "admitted" ? (
            <Badge>Admitted</Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          )}
          {invitee.inactive && <Badge variant="destructive">Inactive</Badge>}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          {editingSeat ? (
            <>
              <Input
                value={seatValue}
                onChange={(e) => setSeatValue(e.target.value)}
                placeholder="Seat no."
                className="h-6 w-24 px-1.5 py-0 text-xs"
                maxLength={20}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSaveSeat();
                  if (e.key === "Escape") setEditingSeat(false);
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => void handleSaveSeat()}
                disabled={savingSeat}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                {savingSeat ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setEditingSeat(false)} className="text-xs hover:underline">
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setEditingSeat(true)} className="hover:underline">
              {invitee.seatNumber ? `Seat ${invitee.seatNumber}` : "Set seat"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-3.5 shrink-0" />
          <select
            value={invitee.seatGroup?.id ?? ""}
            onChange={(e) => void handleSeatGroupChange(e.target.value)}
            disabled={savingSeatGroup}
            className="h-6 rounded-md border border-input bg-transparent px-1 text-xs outline-none disabled:opacity-50"
          >
            <option value="">No seat group</option>
            {seatGroups.map((group) => {
              const isCurrent = group.id === invitee.seatGroup?.id;
              const isFull = group.guestCount >= group.maxSize && !isCurrent;
              return (
                <option key={group.id} value={group.id} disabled={isFull}>
                  {group.name} ({group.guestCount}/{group.maxSize}){isFull ? " — full" : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <QrCell token={invitee.inviteToken} />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggleInactive}
          disabled={togglingInactive}
          title={
            invitee.inactive
              ? "Move back to the active list"
              : "Mark inactive — keeps their invite, moves them off the main list"
          }
        >
          {togglingInactive ? (
            <Loader2 className="animate-spin" />
          ) : invitee.inactive ? (
            <Undo2 />
          ) : (
            <UserX />
          )}
          {invitee.inactive ? "Reactivate" : "Mark inactive"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          title="Remove invitee"
        >
          {deleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  );
}
