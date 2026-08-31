import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { RentalRequestStatus } from "../../../prisma/generated/prisma/enums";
import { CreateReviewPayload } from "./review.interface";

const createReview = async (tenantId: string, payload: CreateReviewPayload) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.userId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review your own rental",
    );
  }

  if (rentalRequest.status !== RentalRequestStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review a completed rental",
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: { rentalRequestId: payload.rentalRequestId },
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This rental has already been reviewed",
    );
  }

  const review = await prisma.review.create({
    data: {
      userId: tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId: rentalRequest.id,
      rating: payload.rating,
      review: payload.review,
    },
  });

  return review;
};

export const reviewService = {
  createReview,
};
