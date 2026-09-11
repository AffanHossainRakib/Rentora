import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import { parseDurationToMs } from "../../utils/parseDurationToMs";
import config from "../../config";

const isProduction = config.node_env === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
} as const;

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await authService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User created successfully.",
      data: { user },
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: parseDurationToMs(config.jwt_access_expires_in ?? "1d"),
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: parseDurationToMs(config.jwt_refresh_expires_in ?? "7d"),
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully.",
      data: { accessToken, refreshToken },
    });
  },
);

const refreshAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = await authService.refreshAccessToken(
      req.body.refreshToken ?? req.cookies.refreshToken,
    );

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: parseDurationToMs(config.jwt_access_expires_in ?? "1d"),
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Access token refreshed successfully.",
      data: { accessToken },
    });
  },
);

const logoutUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged out successfully.",
      data: null,
    });
  },
);

const getCurrentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await authService.getMyProfilefromDB(req.user?.id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile fetched successfully.",
      data: { user },
    });
  },
);

export const authController = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
};
