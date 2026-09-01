import { prisma } from "../../lib/prisma";
import { CreateCategoryPayload } from "./category.interface";

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  const shaped = categories.map((category) => category.name);

  return { categories: shaped };
};

const createCategory = async (payload: CreateCategoryPayload) => {
  const { name } = payload;

  const formatedName =
    name.trim().toLowerCase().at(0)?.toUpperCase() +
    name.trim().toLowerCase().slice(1);

  const category = await prisma.category.create({
    data: { name: formatedName },
  });

  return category;
};

export const categoryService = {
  getAllCategories,
  createCategory,
};
