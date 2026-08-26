import { User } from "../../../prisma/generated/prisma/client";

export type RegisterUserPayload = Omit<
  User,
  "id" | "isActive" | "createdAt" | "updatedAt"
> & {
  bio?: string;
  profilePicture?: string;
};
