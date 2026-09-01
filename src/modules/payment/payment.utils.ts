import Stripe from "stripe";
import {
  PaymentStatus,
  RentalRequestStatus,
} from "../../../prisma/generated/prisma/enums";
import { prisma } from "../../lib/prisma";

export const CURRENCY = "usd"; // ponytail: no per-property currency field exists, so payments are always charged in USD test-mode

export const handleCheckoutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalRequestId = session.metadata?.rentalRequestId;

  if (!rentalRequestId) {
    console.log("Payment webhook: missing rentalRequestId in session metadata");
    return;
  }

  const payment = await prisma.payment.findFirst({
    where: { rentalRequestId, transactionId: session.id },
  });

  if (!payment) {
    console.log(`Payment webhook: no payment found for session ${session.id}`);
    return;
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: (session.payment_intent as string) ?? session.id,
        paidAt: new Date(),
      },
    }),
    prisma.rentalRequest.update({
      where: { id: rentalRequestId },
      data: { status: RentalRequestStatus.ACTIVE },
    }),
  ]);
};

export const handleCheckoutExpired = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalRequestId = session.metadata?.rentalRequestId;

  if (!rentalRequestId) {
    return;
  }

  const payment = await prisma.payment.findFirst({
    where: {
      rentalRequestId,
      transactionId: session.id,
      status: PaymentStatus.PENDING,
    },
  });

  if (!payment) {
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });
};
