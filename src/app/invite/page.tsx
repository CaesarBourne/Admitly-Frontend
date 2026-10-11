import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteeAutoLogin } from "@/components/auth/InviteeAutoLogin";
import { apiFetch } from "@/lib/api-server";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { env } from "@/lib/env";

interface InviteeInfo {
  id: string;
  eventId: string;
}

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const user = await getCurrentUser();

  if (user && isAdmin(user)) {
    if (t) {
      const res = await apiFetch("/auth/invitee-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: t }),
      });
      if (res.ok) {
        const info = (await res.json()) as InviteeInfo;
        redirect(`/admin/events/${info.eventId}/qr/${info.id}`);
      }
    }
    redirect("/admin");
  }

  // An invitee session may already be active on this device (e.g. a staff
  // phone that scanned a previous invitee's code). If a token is present it
  // always wins — (re)authenticate as THAT invitee rather than silently
  // keeping whoever is currently logged in.
  if (user && !t) {
    redirect("/welcome");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{env.NEXT_PUBLIC_PRODUCT_NAME}</CardTitle>
          {!t && <CardDescription>Invalid invitation link.</CardDescription>}
        </CardHeader>
        <CardContent>
          {t ? (
            <InviteeAutoLogin token={t} />
          ) : (
            <p role="alert" className="text-sm text-destructive">
              This link is invalid — no invite token found. Please scan your QR code again.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
