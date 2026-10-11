import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, QrCode, ScanLine, User, UserX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateInviteeForm } from "@/components/admin/CreateInviteeForm";
import { InviteeRow } from "@/components/admin/InviteeRow";
import { SeatGroupsPanel } from "@/components/admin/SeatGroupsPanel";
import { getEventAction } from "@/lib/actions/events";
import { getInviteesAction } from "@/lib/actions/invitees";
import { getSeatGroupsAction } from "@/lib/actions/seat-groups";
import { requireAdmin } from "@/lib/auth";

export default async function EventAdminPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdmin();
  const { eventId } = await params;

  const event = await getEventAction(eventId);
  if (!event) redirect("/admin");

  const [allInvitees, seatGroups] = await Promise.all([
    getInviteesAction(eventId),
    getSeatGroupsAction(eventId),
  ]);
  const invitees = allInvitees.filter((i) => !i.inactive);
  const inactiveInvitees = allInvitees.filter((i) => i.inactive);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/admin"><ArrowLeft /></Link>} />
          <div>
            <p className="text-xl font-semibold">{event.name}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Invitee Management
            </p>
          </div>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href={`/admin/events/${eventId}/scan`}>
              <ScanLine /> Scan QR
            </Link>
          }
        />
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
        {/* Create invitee */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="text-primary" /> Invite someone
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Enter a name to generate a unique QR code. They scan it to instantly check in — no
              password needed.
            </p>
            <CreateInviteeForm eventId={eventId} />
          </CardContent>
        </Card>

        {/* Seat groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" /> Seat groups
            </CardTitle>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={`/admin/events/${eventId}/seat-groups`}>View full list</Link>}
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <SeatGroupsPanel eventId={eventId} seatGroups={seatGroups} />
          </CardContent>
        </Card>

        {/* Invitee list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="text-primary" /> Invitees ({invitees.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {invitees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invitees yet — create one above.</p>
            ) : (
              invitees.map((invitee, i) => (
                <InviteeRow
                  key={invitee.id}
                  eventId={eventId}
                  invitee={invitee}
                  seatGroups={seatGroups}
                  displayNumber={i + 1}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Inactive — invite kept, just moved off the main list */}
        {inactiveInvitees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserX className="text-primary" /> Inactive ({inactiveInvitees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {inactiveInvitees.map((invitee, i) => (
                <InviteeRow
                  key={invitee.id}
                  eventId={eventId}
                  invitee={invitee}
                  seatGroups={seatGroups}
                  displayNumber={i + 1}
                />
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
