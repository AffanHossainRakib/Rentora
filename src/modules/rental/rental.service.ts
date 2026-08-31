import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { getPaginationParams } from "../../utils/pagination";
import {
  Role,
  RentalRequestStatus,
} from "../../../prisma/generated/prisma/enums";
import {
  CreateRentalRequestPayload,
  GetRentalRequestsQuery,
} from "./rental.interface";

const createRentalRequest = async (
  tenantId: string,
  payload: CreateRentalRequestPayload,
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (!property.isAvailable) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This property is not currently available",
    );
  }

  const rentalRequest = await prisma.rentalRequest.create({
    data: {
      userId: tenantId,
      propertyId: payload.propertyId,
      startDate: payload.startDate,
      endDate: payload.endDate,
    },
  });

  return rentalRequest;
};

const getMyRentalRequests = async (
  tenantId: string,
  query: GetRentalRequestsQuery,
) => {
  const { status } = query;
  const { page, limit, skip } = getPaginationParams(query);

  const where = { userId: tenantId, ...(status && { status }) };

  const [rentalRequests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        property: { include: { category: { select: { name: true } } } },
      },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  const shaped = rentalRequests.map(({ property, ...rest }) => {
    const { category, categoryId, ...propertyRest } = property;
    return { ...rest, property: { ...propertyRest, category: category.name } };
  });

  return {
    rentalRequests: shaped,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const getRentalRequestById = async (userId: string, role: Role, id: string) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  const isTenant = rentalRequest.userId === userId;
  const isOwningLandlord = rentalRequest.property.userId === userId;

  if (!isTenant && !isOwningLandlord && role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view this rental request",
    );
  }
  const shaped = {
    ...rentalRequest,
    property: {
      ...rentalRequest.property,
      category: rentalRequest.property.category.name,
    },
  };

  return shaped;
};

const getLandlordRequests = async (
  landlordUserId: string,
  query: GetRentalRequestsQuery,
) => {
  const { status } = query;
  const { page, limit, skip } = getPaginationParams(query);

  const where = {
    property: { userId: landlordUserId },
    ...(status && { status }),
  };

  const [rentalRequests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        property: { include: { category: { select: { name: true } } } },
      },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  const shaped = rentalRequests.map(({ property, ...rest }) => {
    const { category, categoryId, ...propertyRest } = property;
    return { ...rest, property: { ...propertyRest, category: category.name } };
  });

  return {
    rentalRequests: shaped,
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const updateRentalRequestStatus = async (
  landlordUserId: string,
  requestId: string,
  status:
    | typeof RentalRequestStatus.APPROVED
    | typeof RentalRequestStatus.REJECTED,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: requestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.property.userId !== landlordUserId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update this rental request",
    );
  }

  if (
    rentalRequest.status !== RentalRequestStatus.PENDING &&
    rentalRequest.status !== RentalRequestStatus.APPROVED &&
    rentalRequest.status !== RentalRequestStatus.REJECTED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot ${status === RentalRequestStatus.APPROVED ? "approve" : "reject"} a rental request that is not PENDING, APPROVED, or REJECTED`,
    );
  }

  const updated = await prisma.rentalRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return updated;
};

export const rentalService = {
  createRentalRequest,
  getMyRentalRequests,
  getRentalRequestById,
  getLandlordRequests,
  updateRentalRequestStatus,
};
