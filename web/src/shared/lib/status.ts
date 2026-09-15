import type { PaymentStatus, RentalStatus, Role } from "@/shared/types";

export type Tone = "neutral" | "accent" | "positive" | "warning" | "critical";

export const RENTAL_TONE: Record<RentalStatus, Tone> = {
  PENDING: "warning",
  APPROVED: "accent",
  REJECTED: "critical",
  ACTIVE: "positive",
  COMPLETED: "neutral",
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  PENDING: "warning",
  COMPLETED: "positive",
  FAILED: "critical",
};

export const RENTAL_HINT: Record<RentalStatus, string> = {
  PENDING: "Awaiting the landlord's decision.",
  APPROVED: "Approved — pay to activate the tenancy.",
  REJECTED: "The landlord declined this request.",
  ACTIVE: "Tenancy is running.",
  COMPLETED: "Tenancy finished. A review can be left once.",
};

export const RENTAL_STATUSES: RentalStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACTIVE",
  "COMPLETED",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
];

/**
 * Transitions the API accepts, keyed by caller role. Landlords may only decide
 * pending requests; admins additionally close out an active tenancy.
 */
const TRANSITIONS: Record<Role, Partial<Record<RentalStatus, RentalStatus[]>>> =
  {
    LANDLORD: { PENDING: ["APPROVED", "REJECTED"] },
    ADMIN: { PENDING: ["APPROVED", "REJECTED"], ACTIVE: ["COMPLETED"] },
    TENANT: {},
  };

export function allowedTransitions(
  role: Role,
  status: RentalStatus,
): RentalStatus[] {
  return TRANSITIONS[role][status] ?? [];
}
