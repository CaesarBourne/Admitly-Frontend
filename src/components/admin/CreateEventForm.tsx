"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createEventAction } from "@/lib/actions/events";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (pending) return;
    if (state === initialState) return;
    if (state.error) toast.error(state.error);
    else {
      toast.success("Event created.");
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap gap-3">
      <Input
        name="name"
        type="text"
        placeholder="Event name (e.g. Product Launch 2026)"
        maxLength={120}
        required
        className="max-w-xs"
      />
      <Input name="eventDate" type="date" className="max-w-[10rem]" />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Plus />}
        {pending ? "Creating…" : "Create event"}
      </Button>
    </form>
  );
}
