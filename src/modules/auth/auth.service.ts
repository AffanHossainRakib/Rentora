import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { loginUserPayload } from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { AppError } from "../../errors/AppError";

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

export const authService = { loginUser };
