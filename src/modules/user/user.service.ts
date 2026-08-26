import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./user.interface";
import { isValidEmail } from "../../utils/isValidEmail";
import { Role } from "../../../prisma/generated/prisma/enums";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, bio, profilePicture } = payload;

  if (!name?.trim() || !email?.trim() || !password || !role) {
    throw new Error("Name, Email, Password and Role are required fields");
  }

  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Invalid email address, please provide a valid email");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const normalizedRole = role.trim().toUpperCase();
  if (!Object.values(Role).includes(normalizedRole as Role)) {
    throw new Error("Invalid role. Must be one of TENANT, LANDLORD, or ADMIN");
  }
  const userRole = normalizedRole as Role;

  if (userRole === Role.ADMIN) {
    throw new Error("You are not allowed to create an admin user");
  }

  const userExists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (userExists) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
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
