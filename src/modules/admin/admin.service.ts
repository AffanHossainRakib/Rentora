import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { getPaginationParams } from "../../utils/pagination";
import { GetUsersQuery, PaginationQuery } from "./admin.interface";

const getAllUsers = async (query: GetUsersQuery) => {
  const { role } = query;
  const { page, limit, skip } = getPaginationParams(query);

  const where = { ...(role && { role }) };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      omit: { password: true },
      include: { profile: true },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const updateUserStatus = async (userId: string, isActive: boolean) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    omit: { password: true },
  });

  return updated;
};

const getAllProperties = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { name: true },
        },
        landlord: {
          omit: { password: true },
        },
      },
    }),
    prisma.property.count(),
  ]);

  const shaped = properties.map(({ category, categoryId, ...rest }) => ({
    ...rest,
    category: category.name,
  }));

  return {
    properties: shaped,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getAllRentalRequests = async (query: PaginationQuery) => {
  const { page, limit, skip } = getPaginationParams(query);

  const [rentalRequests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          include: {
            category: { select: { name: true } },
          },
        },
        tenant: {
          omit: { password: true },
        },
      },
    }),
    prisma.rentalRequest.count(),
  ]);

  const shaped = rentalRequests.map(({ property, propertyId, ...rest }) => ({
    ...rest,
    property: {
      ...property,
      category: property.category.name,
    },
  }));

  return {
    rentalRequests: shaped,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
};
