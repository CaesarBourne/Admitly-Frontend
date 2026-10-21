import Link from "next/link";
import { LogOut, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { logoutAction } from "@/lib/actions/auth";
import { requireInvitee } from "@/lib/auth";
import { env } from "@/lib/env";

export default async function WelcomePage() {
  const user = await requireInvitee();

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {env.NEXT_PUBLIC_PRODUCT_NAME}
          </span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon" title="Sign out">
              <LogOut />
            </Button>
          </form>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div>
            <h1 className="text-3xl font-semibold">
              Welcome,
              <br />
              <span className="text-primary">{user.name ?? "Guest"}</span>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              You&apos;re confirmed for this event. Show this page at the entrance if asked.
            </p>
            {(user.seatNumber || user.seatGroupName) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {user.seatNumber && (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <MapPin className="size-4" />
                    Seat {user.seatNumber}
                  </p>
                )}
                {user.seatGroupName && (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    <Users className="size-4" />
                    {user.groupLabel ?? "Group"}: <span className="font-bold">{user.seatGroupName}</span>
                  </p>
                )}
              </div>
            )}
            {user.admissionStatus === "admitted" && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                Already checked in
              </p>
            )}
          </div>

          <Button variant="outline" nativeButton={false} render={<Link href="/welcome">Refresh</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
