import { RentalRequestStatus } from "../../../prisma/generated/prisma/enums";

// ACTIVE -> COMPLETED is not here: completion happens automatically once
// endDate passes (cron job, not yet implemented), not via landlord action.
export const ALLOWED_STATUS_TRANSITIONS_LANDLORD: Partial<
  Record<RentalRequestStatus, RentalRequestStatus[]>
> = {
  [RentalRequestStatus.PENDING]: [
    RentalRequestStatus.APPROVED,
    RentalRequestStatus.REJECTED,
  ],
  [RentalRequestStatus.APPROVED]: [],
  [RentalRequestStatus.REJECTED]: [],
};

// Admin keeps the full transition set, including a manual ACTIVE -> COMPLETED
// override for cases the future auto-completion cron hasn't caught yet.
export const ALLOWED_STATUS_TRANSITIONS_ADMIN: Partial<
  Record<RentalRequestStatus, RentalRequestStatus[]>
> = {
  [RentalRequestStatus.PENDING]: [
    RentalRequestStatus.APPROVED,
    RentalRequestStatus.REJECTED,
  ],
  [RentalRequestStatus.APPROVED]: [],
  [RentalRequestStatus.REJECTED]: [],
  [RentalRequestStatus.ACTIVE]: [RentalRequestStatus.COMPLETED],
  [RentalRequestStatus.COMPLETED]: [],
};
