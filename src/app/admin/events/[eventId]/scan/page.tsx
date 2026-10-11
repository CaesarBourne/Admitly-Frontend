import { QRScannerClient } from "@/components/admin/QRScannerClient";
import { requireAdmin } from "@/lib/auth";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  await requireAdmin();
  const { eventId } = await params;

  // The scanner is entirely client-side (camera + jsQR).
  // Auth is checked server-side here so unauthenticated visitors get a redirect.
  return <QRScannerClient eventId={eventId} />;
}
