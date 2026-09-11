import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { loginUserPayload, RegisterUserPayload } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { AppError } from "../../errors/AppError";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, role, bio, profilePicture } = payload;

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

const DUMMY_PASSWORD_HASH =
  "$2b$10$EZODxWq31h9H.amvyCCB4uPCnum4mBAxroPhj.XmMBsd9biXbmUdW";

const loginUser = async (payload: loginUserPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const isPasswordMatched = await bcrypt.compare(
    password,
    user ? user.password : DUMMY_PASSWORD_HASH,
  );

  if (!user || !isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid email or password, please try again",
    );
  }

  if (!user.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been blocked. Please contact support.",
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

  const verifiedToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );
  if (!verifiedToken.success) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token. Please log in again.",
    );
  }

  const { id } = verifiedToken.data as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user?.isActive) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is deactivated. Please contact support.",
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in,
  );

  return { accessToken };
};

const getMyProfilefromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: {
      profile: true,
    },
  });

  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUser,
  refreshAccessToken,
  getMyProfilefromDB,
};
