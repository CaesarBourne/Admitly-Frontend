"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createInviteeAction } from "@/lib/actions/invitees";
import type { ActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: ActionState = {};

export function CreateInviteeForm({ eventId }: { readonly eventId: string }) {
  const boundAction = createInviteeAction.bind(null, eventId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (pending) return;
    if (state === initialState) return;
    if (state.error) toast.error(state.error);
    else {
      toast.success("Invitee created.");
      formRef.current?.reset();
    }
  }, [state, pending]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap gap-3">
      <Input
        name="name"
        type="text"
        placeholder="Invitee name (e.g. Jane Smith)"
        maxLength={80}
        required
        className="max-w-xs"
      />
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        {pending ? "Creating…" : "Create & get QR"}
      </Button>
    </form>
  );
}
