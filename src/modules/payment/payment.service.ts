import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../errors/AppError";
import config from "../../config";
import { getPaginationParams } from "../../utils/pagination";
import {
  PaymentProvider,
  PaymentStatus,
  Role,
  RentalRequestStatus,
} from "../../../prisma/generated/prisma/enums";
import { CreatePaymentPayload, GetPaymentsQuery } from "./payment.interface";
import {
  CURRENCY,
  handleCheckoutCompleted,
  handleCheckoutExpired,
} from "./payment.utils";

const createPayment = async (
  tenantId: string,
  payload: CreatePaymentPayload,
) => {
  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: payload.rentalRequestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.userId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only pay for your own rental request",
    );
  }

  const existingPayments = await prisma.payment.findMany({
    where: {
      rentalRequestId: rentalRequest.id,
      status: {
        in: [PaymentStatus.COMPLETED, PaymentStatus.PENDING],
      },
    },
  });

  const existingCompletedPayment = existingPayments.find(
    (p) => p.status === PaymentStatus.COMPLETED,
  );
  const existingPendingPayment = existingPayments.find(
    (p) => p.status === PaymentStatus.PENDING,
  );

  if (existingCompletedPayment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This rental request has already been paid for",
    );
  }

  if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Payment can only be made for an approved rental request",
    );
  }

  if (existingPendingPayment?.transactionId) {
    const existingSession = await stripe.checkout.sessions
      .retrieve(existingPendingPayment.transactionId)
      .catch(() => null);
    if (existingSession?.status === "open") {
      return {
        paymentUrl: existingSession.url,
        payment: existingPendingPayment,
      };
    }
  }

  const amount = rentalRequest.property.price;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: CURRENCY,
          unit_amount: Math.round(amount * 100),
          product_data: { name: `Rental: ${rentalRequest.property.title}` },
        },
        quantity: 1,
      },
    ],
    metadata: { rentalRequestId: rentalRequest.id },
    success_url: `${config.app_url}?success=true`,
    cancel_url: `${config.app_url}?success=false`,
  });

  const payment = existingPendingPayment
    ? await prisma.payment.update({
        where: { id: existingPendingPayment.id },
        data: { transactionId: session.id, amount, currency: CURRENCY },
      })
    : await prisma.payment.create({
        data: {
          rentalRequestId: rentalRequest.id,
          status: PaymentStatus.PENDING,
          provider: PaymentProvider.STRIPE,
          method: "card",
          transactionId: session.id,
          amount,
          currency: CURRENCY,
        },
      });

  return {
    paymentUrl: session.url,
    payment,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.stripe_webhook_secret,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      await handleCheckoutExpired(session);
      break;
    }
    default:
      console.log(`Payment webhook: unhandled event type ${event.type}`);
      break;
  }
};

const getMyPayments = async (tenantId: string, query: GetPaymentsQuery) => {
  const { status } = query;
  const { page, limit, skip } = getPaginationParams(query);

  const where = {
    rentalRequest: { userId: tenantId },
    ...(status && { status }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        rentalRequest: {
          include: {
            property: {
              include: {
                category: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  const shaped = payments.map(({ rentalRequest, ...rest }) => {
    const { property, ...rentalRequestRest } = rentalRequest;
    const { category, categoryId, ...propertyRest } = property;
    return {
      ...rest,
      rentalRequest: {
        ...rentalRequestRest,
        property: { ...propertyRest, category: category.name },
      },
    };
  });

  return {
    payments: shaped,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getPaymentById = async (userId: string, role: Role, id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      rentalRequest: {
        include: {
          property: { include: { category: { select: { name: true } } } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const isTenant = payment.rentalRequest.userId === userId;
  const isOwningLandlord = payment.rentalRequest.property.userId === userId;

  if (!isTenant && !isOwningLandlord && role !== Role.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view this payment",
    );
  }
  const { property, ...rentalRequestRest } = payment.rentalRequest;
  const { category, categoryId, ...propertyRest } = property;
  const shaped = {
    ...payment,
    rentalRequest: {
      ...rentalRequestRest,
      property: { ...propertyRest, category: category.name },
    },
  };
  return { payment: shaped };
};

export const paymentService = {
  createPayment,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};
