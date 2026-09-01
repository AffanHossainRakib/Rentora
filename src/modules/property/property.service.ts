import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";
import { getPaginationParams } from "../../utils/pagination";
import { RentalRequestStatus } from "../../../prisma/generated/prisma/enums";
import {
  CreatePropertyPayload,
  GetPropertiesQuery,
  UpdatePropertyPayload,
} from "./property.interface";
import { assertPropertyOwnership, findCategoryId } from "./property.utils";

const getAllProperties = async (query: GetPropertiesQuery) => {
  const { searchTerm, location, category, isAvailable, priceMin, priceMax } =
    query;

  const { page, limit, skip } = getPaginationParams(query);

  const where = {
    ...(searchTerm && {
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" as const } },
        {
          description: { contains: searchTerm, mode: "insensitive" as const },
        },
      ],
    }),
    ...(location && {
      location: { contains: location, mode: "insensitive" as const },
    }),
    ...(category && {
      category: {
        name: { contains: category, mode: "insensitive" as const },
      },
    }),
    ...(isAvailable !== undefined && { isAvailable }),
    ...((priceMin !== undefined || priceMax !== undefined) && {
      price: {
        ...(priceMin !== undefined && { gte: priceMin }),
        ...(priceMax !== undefined && { lte: priceMax }),
      },
    }),
  };

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: { category: { select: { name: true } } },
    }),
    prisma.property.count({ where }),
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

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: { category: { select: { name: true } } },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }
  const { category, categoryId, ...propertyRest } = property;
  const shaped = {
    ...propertyRest,
    category: category.name,
  };

  return shaped;
};

const createProperty = async (
  userId: string,
  payload: CreatePropertyPayload,
) => {
  const categoryId = await findCategoryId(payload.category);
  const { category, ...restPayload } = payload;

  const propertyData = {
    ...restPayload,
    categoryId,
    userId,
  };

  const property = await prisma.property.create({
    data: { ...propertyData },
  });

  return property;
};

const updateProperty = async (
  userId: string,
  propertyId: string,
  payload: UpdatePropertyPayload,
) => {
  await assertPropertyOwnership(userId, propertyId);

  const { category, ...restPayload } = payload;
  const propertyData = {
    ...restPayload,
    ...(category && { categoryId: await findCategoryId(category) }),
  };

  const property = await prisma.property.update({
    where: { id: propertyId },
    data: propertyData,
  });

  return property;
};

const deleteProperty = async (userId: string, propertyId: string) => {
  await assertPropertyOwnership(userId, propertyId);

  const activeRequest = await prisma.rentalRequest.findFirst({
    where: {
      propertyId,
      status: {
        in: [
          RentalRequestStatus.PENDING,
          RentalRequestStatus.APPROVED,
          RentalRequestStatus.ACTIVE,
        ],
      },
    },
  });

  if (activeRequest) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Cannot remove a property with a pending, approved, or active rental request",
    );
  }

  await prisma.property.delete({ where: { id: propertyId } });
};

export const propertyService = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
