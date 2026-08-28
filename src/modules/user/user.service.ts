import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./user.interface";
import { Role } from "../../../prisma/generated/prisma/enums";
import { AppError } from "../../errors/AppError";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, bio, profilePicture } = payload;

  if (role === Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to create an admin user",
    );
  }

  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      profile: {
        create: {
          bio,
          profilePicture,
        },
      },
    },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return user;
};

export const userService = {
  registerUserIntoDB,
};
