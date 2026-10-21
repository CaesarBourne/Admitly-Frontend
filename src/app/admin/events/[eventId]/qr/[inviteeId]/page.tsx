import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QRValidateClient } from "@/components/admin/QRValidateClient";
import { getEventAction } from "@/lib/actions/events";
import { apiFetch } from "@/lib/api-server";
import { requireAdmin } from "@/lib/auth";
import type { InviteeDto } from "@/lib/types";

export default async function QrValidatePage({
  params,
}: {
  params: Promise<{ eventId: string; inviteeId: string }>;
}) {
  await requireAdmin();
  const { eventId, inviteeId } = await params;

  const [res, event] = await Promise.all([apiFetch(`/invitees/${inviteeId}`), getEventAction(eventId)]);
  if (!res.ok || !event) redirect(`/admin/events/${eventId}`);
  const invitee = (await res.json()) as InviteeDto;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 border-b p-4">
        <Button
          variant="ghost"
          nativeButton={false}
          render={
            <Link href={`/admin/events/${eventId}`}>
              <ArrowLeft /> Invitee list
            </Link>
          }
        />
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Entrance Scan
        </span>
      </header>

      <main className="flex justify-center p-8">
        <QRValidateClient
          eventId={eventId}
          inviteeId={inviteeId}
          name={invitee.name ?? "Invitee"}
          avatarUrl={invitee.avatarUrl}
          admissionStatus={invitee.admissionStatus}
          admittedAt={invitee.admittedAt}
          seatNumber={invitee.seatNumber}
          seatGroupName={event.groupingEnabled ? (invitee.seatGroup?.name ?? null) : null}
          groupLabel={event.groupLabel}
        />
      </main>
    </div>
  );
}
