import { prisma } from "../../lib/prisma";
import { CreateCategoryPayload } from "./category.interface";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return categories.map((category) => category.name);
};

const createCategory = async (payload: CreateCategoryPayload) => {
  const { name } = payload;

  const formatedName = name
    .trim()
    .split(/\s+/)
    .map((word) => word[0]!.toUpperCase() + word.slice(1).toLowerCase())
    .join("-");

  const category = await prisma.category.create({
    data: { name: formatedName },
  });

  return category;
};

export const categoryService = {
  getAllCategories,
  createCategory,
};
