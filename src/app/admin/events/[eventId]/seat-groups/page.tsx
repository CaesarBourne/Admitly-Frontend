import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventAction } from "@/lib/actions/events";
import { getInviteesAction } from "@/lib/actions/invitees";
import { getSeatGroupsAction } from "@/lib/actions/seat-groups";
import { requireAdmin } from "@/lib/auth";
import type { InviteeDto } from "@/lib/types";

export default async function SeatGroupsListPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdmin();
  const { eventId } = await params;

  const event = await getEventAction(eventId);
  if (!event) redirect("/admin");

  const [invitees, seatGroups] = await Promise.all([
    getInviteesAction(eventId),
    getSeatGroupsAction(eventId),
  ]);

  const byGroup = new Map<string, InviteeDto[]>();
  const unassigned: InviteeDto[] = [];
  for (const invitee of invitees) {
    if (invitee.seatGroup) {
      const list = byGroup.get(invitee.seatGroup.id) ?? [];
      list.push(invitee);
      byGroup.set(invitee.seatGroup.id, list);
    } else {
      unassigned.push(invitee);
    }
  }

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
          Seat Groups — {event.name}
        </span>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
        {seatGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No seat groups yet — create one from the invitee list.
          </p>
        ) : (
          seatGroups.map((group) => {
            const members = byGroup.get(group.id) ?? [];
            const isFull = members.length >= group.maxSize;
            return (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <Users className="size-4 text-primary" />
                      {group.name}
                    </span>
                    <Badge variant={isFull ? "default" : "secondary"}>
                      {members.length}/{group.maxSize}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No invitees assigned yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {members.map((m) => (
                        <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="font-medium">
                            {m.name || "—"}
                            {m.inactive && (
                              <Badge variant="destructive" className="ml-2">
                                Inactive
                              </Badge>
                            )}
                          </span>
                          {m.seatNumber && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <MapPin className="size-3.5" /> Seat {m.seatNumber}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}

        {unassigned.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Not in a seat group ({unassigned.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {unassigned.map((m) => (
                  <li key={m.id} className="text-sm font-medium">
                    {m.name || "—"}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
