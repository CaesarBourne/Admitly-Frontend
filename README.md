# Admitly Frontend

Next.js admin UI + invitee flow for Admitly. Talks to the
[admitly-backend](../admitly-backend) API.

## Setup

```bash
npm install
cp .env.example .env   # points at http://localhost:3001 by default
npm run dev
```

Requires the backend running (see its README) at the URL in
`NEXT_PUBLIC_API_BASE_URL`.

## Flows

- **`/signup`, `/login`** — org admin creates a workspace (organization +
  owner account) or signs in.
- **`/admin`** — lists the org's events; create new ones here.
- **`/admin/events/[eventId]`** — the main per-event screen: invite
  invitees (generates a QR), assign seat numbers and seat groups, mark
  someone inactive (keeps their invite, moves them off the main list —
  also usable as a general "deactivate" switch), upload an invitee photo.
- **`/admin/events/[eventId]/seat-groups`** — full seat-group roster.
- **`/admin/events/[eventId]/scan`** — camera-based QR scanner for staff at
  the door.
- **`/admin/events/[eventId]/qr/[inviteeId]`** — entrance admission screen
  reached after a scan; shows the invitee's photo, seat, seat group, and an
  "Admit to Event" button.
- **`/invite?t=TOKEN`** — the link encoded in an invitee's QR code; signs
  them in and redirects to `/welcome`.
- **`/welcome`** — invitee-facing confirmation page (name, seat, seat
  group, admission status).

## Notes

- UI primitives (`src/components/ui/*`) use `@base-ui/react` + a small
  `cva`-based variant system — the same pattern as the reference app this
  was extracted from, generalized with a neutral color palette instead of
  event-specific branding. Swap `src/app/globals.css`'s CSS variables to
  re-theme.
- Server Actions (`src/lib/actions/*`) are the only place API calls happen
  from the frontend; they attach the session cookie via `apiFetch`
  (`src/lib/api-server.ts`).
