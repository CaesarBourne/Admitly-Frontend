export type AdmissionStatus = "pending" | "admitted";

/** Authenticated session, decoded from GET /auth/me or a login/signup response.
 *  Two session kinds share this shape: an org admin ('admin') and a scanned
 *  invitee ('invitee') — distinguish by `type` before reading role-only or
 *  invitee-only fields. */
export interface AuthUser {
  id: string;
  sub?: string;
  type: "admin" | "invitee";
  orgId: string;
  orgName?: string;
  eventId?: string;
  role?: "owner" | "admin";
  email?: string | null;
  name?: string;
  seatNumber?: string | null;
  seatGroupName?: string | null;
  inactive?: boolean;
  admissionStatus?: AdmissionStatus;
}

/** Invitee info returned by POST /auth/invitee-info (admin scan lookup). */
export interface InviteeInfo {
  id: string;
  eventId: string;
  name?: string;
  admissionStatus: AdmissionStatus;
  admittedAt: string | null;
  seatNumber: string | null;
  seatGroupName: string | null;
  avatarUrl: string | null;
}

export interface EventDto {
  id: string;
  name: string;
  eventDate: string | null;
  createdAt: string;
}

export interface SeatGroupDto {
  id: string;
  eventId: string;
  name: string;
  maxSize: number;
  guestCount: number;
  createdAt?: string;
}

/** Full invitee record returned by GET /events/:eventId/invitees and GET /invitees/:id. */
export interface InviteeDto {
  id: string;
  eventId: string;
  name: string;
  inviteToken: string;
  seatNumber: string | null;
  seatGroup: { id: string; name: string } | null;
  admissionStatus: AdmissionStatus;
  admittedAt: string | null;
  inactive: boolean;
  avatarUrl: string | null;
  createdAt: string;
}
