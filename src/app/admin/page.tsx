import Link from "next/link";
import { Calendar, LogOut, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateEventForm } from "@/components/admin/CreateEventForm";
import { getEventsAction } from "@/lib/actions/events";
import { logoutAction } from "@/lib/actions/auth";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const events = await getEventsAction();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b p-4">
        <div>
          <p className="text-xl font-semibold">{admin.orgName ?? env.NEXT_PUBLIC_PRODUCT_NAME}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Events</p>
        </div>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" size="icon" title="Sign out">
            <LogOut />
          </Button>
        </form>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" /> Create an event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateEventForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet — create one above.</p>
            ) : (
              events.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/${event.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    {event.eventDate && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    <ScanLine className="size-3.5" /> Manage
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
