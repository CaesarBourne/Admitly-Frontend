"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateEventGroupingAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LABEL_SUGGESTIONS = ["Table", "Team", "Section", "Cabin", "Seat group"];

export function GroupingSettings({
  eventId,
  groupingEnabled,
  groupLabel,
}: {
  readonly eventId: string;
  readonly groupingEnabled: boolean;
  readonly groupLabel: string;
}) {
  const [label, setLabel] = useState(groupLabel);
  const [saving, setSaving] = useState(false);

  async function save(enabled: boolean, nextLabel: string) {
    setSaving(true);
    const result = await updateEventGroupingAction(eventId, enabled, nextLabel);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(enabled ? "Grouping settings saved." : "Grouping turned off.");
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={groupingEnabled}
          disabled={saving}
          onChange={(e) => void save(e.target.checked, label)}
          className="size-4 accent-primary"
        />
        Group invitees for this event
      </label>
      <p className="text-sm text-muted-foreground">
        Optional — put invitees into tables, teams, sections or anything else. Turning it off
        just hides groups; existing groups and assignments are kept.
      </p>

      {groupingEnabled && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="What do you call a group? e.g. Table"
              maxLength={30}
              className="max-w-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") void save(true, label);
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void save(true, label)}
              disabled={saving || label.trim() === groupLabel}
            >
              {saving && <Loader2 className="animate-spin" />}
              Save name
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LABEL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setLabel(s)}
                className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
