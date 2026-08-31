import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { sendResponse } from "./utils/sendResponse";
import httpStatus from "http-status";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { propertyRoutes } from "./modules/property/property.route";
import { landlordPropertyRoutes } from "./modules/property/landlordProperty.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { landlordRequestRoutes } from "./modules/rental/landlordRequest.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rentora is live!",
    data: {},
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/landlord/properties", landlordPropertyRoutes);
app.use("/api/v1/landlord/requests", landlordRequestRoutes);
app.use("/api/v1/rentals", rentalRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin", adminRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
