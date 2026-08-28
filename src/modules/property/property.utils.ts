import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../errors/AppError";

export const assertPropertyOwnership = async (
  userId: string,
  propertyId: string,
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(httpStatus.NOT_FOUND, "Property not found");
  }

  if (property.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to modify this property",
    );
  }

  return property;
};

export const assertCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid category id");
  }

  return category;
};
