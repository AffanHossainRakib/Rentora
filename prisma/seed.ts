import bcrypt from "bcryptjs";
import config from "../src/config";
import { prisma } from "../src/lib/prisma";
import {
  PaymentProvider,
  PaymentStatus,
  RentalRequestStatus,
  Role,
} from "./generated/prisma/client";

async function main() {
  console.log("Seeding database...");

  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const [apartment, house, studio] = await Promise.all([
    prisma.category.create({ data: { name: "Apartment" } }),
    prisma.category.create({ data: { name: "House" } }),
    prisma.category.create({ data: { name: "Studio" } }),
  ]);

  const password = await bcrypt.hash(
    "Password123!",
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@rentnest.test",
      password,
      isActive: true,
      role: Role.ADMIN,
    },
  });
  const landlord1 = await prisma.user.create({
    data: {
      name: "Karim Rahman",
      email: "landlord1@rentnest.test",
      password,
      isActive: true,
      role: Role.LANDLORD,
    },
  });
  const landlord2 = await prisma.user.create({
    data: {
      name: "Fatima Begum",
      email: "landlord2@rentnest.test",
      password,
      isActive: true,
      role: Role.LANDLORD,
    },
  });
  const tenant1 = await prisma.user.create({
    data: {
      name: "Nusrat Jahan",
      email: "tenant1@rentnest.test",
      password,
      isActive: true,
      role: Role.TENANT,
    },
  });
  const tenant2 = await prisma.user.create({
    data: {
      name: "Rafiq Islam",
      email: "tenant2@rentnest.test",
      password,
      isActive: true,
      role: Role.TENANT,
    },
  });

  await Promise.all([
    prisma.profile.create({
      data: {
        userId: tenant1.id,
        bio: "Looking for a cozy place near downtown.",
      },
    }),
    prisma.profile.create({
      data: {
        userId: tenant2.id,
        bio: "Frequent traveler, respectful tenant.",
      },
    }),
    prisma.profile.create({
      data: {
        userId: landlord1.id,
        bio: "Property owner with 5+ years of experience.",
      },
    }),
  ]);

  const downtownApartment = await prisma.property.create({
    data: {
      userId: landlord1.id,
      title: "Sunny Downtown Apartment",
      description: "A bright 2-bedroom apartment in the heart of the city.",
      isAvailable: true,
      location: "Dhaka, Bangladesh",
      price: 25000,
      categoryId: apartment.id,
      amenities: ["WiFi", "Parking", "Air Conditioning"],
      pictures: [],
    },
  });
  const familyHouse = await prisma.property.create({
    data: {
      userId: landlord2.id,
      title: "Cozy Family House",
      description: "Spacious 4-bedroom house with a garden.",
      isAvailable: true,
      location: "Chittagong, Bangladesh",
      price: 45000,
      categoryId: house.id,
      amenities: ["Garden", "Parking", "Furnished"],
      pictures: [],
    },
  });
  const studioUnit = await prisma.property.create({
    data: {
      userId: landlord1.id,
      title: "Modern Studio Unit",
      description: "Compact studio, perfect for a single professional.",
      isAvailable: false,
      location: "Dhaka, Bangladesh",
      price: 15000,
      categoryId: studio.id,
      amenities: ["WiFi", "Furnished"],
      pictures: [],
    },
  });

  const activeRequest = await prisma.rentalRequest.create({
    data: {
      userId: tenant1.id,
      propertyId: studioUnit.id,
      status: RentalRequestStatus.ACTIVE,
      startDate: new Date("2026-08-01T00:00:00Z"),
      endDate: new Date("2027-08-01T00:00:00Z"),
    },
  });
  await prisma.rentalRequest.create({
    data: {
      userId: tenant2.id,
      propertyId: downtownApartment.id,
      status: RentalRequestStatus.PENDING,
      startDate: new Date("2026-09-15T00:00:00Z"),
      endDate: new Date("2027-09-15T00:00:00Z"),
    },
  });
  const completedRequest = await prisma.rentalRequest.create({
    data: {
      userId: tenant1.id,
      propertyId: familyHouse.id,
      status: RentalRequestStatus.COMPLETED,
      startDate: new Date("2025-06-01T00:00:00Z"),
      endDate: new Date("2026-06-01T00:00:00Z"),
    },
  });
  await prisma.rentalRequest.create({
    data: {
      userId: tenant2.id,
      propertyId: familyHouse.id,
      status: RentalRequestStatus.REJECTED,
      startDate: new Date("2026-10-01T00:00:00Z"),
      endDate: new Date("2027-10-01T00:00:00Z"),
    },
  });

  await prisma.payment.create({
    data: {
      rentalRequestId: activeRequest.id,
      status: PaymentStatus.COMPLETED,
      transactionId: "txn_stripe_001",
      amount: 15000,
      method: "card",
      provider: PaymentProvider.STRIPE,
      paidAt: new Date("2026-08-01T00:00:00Z"),
      currency: "BDT",
    },
  });
  await prisma.payment.create({
    data: {
      rentalRequestId: completedRequest.id,
      status: PaymentStatus.COMPLETED,
      transactionId: "txn_sslcommerz_001",
      amount: 45000,
      method: "mobile_banking",
      provider: PaymentProvider.SSLCOMMERZ,
      paidAt: new Date("2025-06-01T00:00:00Z"),
      currency: "BDT",
    },
  });

  await prisma.review.create({
    data: {
      userId: tenant1.id,
      propertyId: familyHouse.id,
      rentalRequestId: completedRequest.id,
      rating: 5,
      review:
        "Wonderful house, very spacious and the landlord was responsive throughout our stay.",
    },
  });

  console.log("Seed complete:");
  console.log(
    `  users: ${admin.email}, ${landlord1.email}, ${landlord2.email}, ${tenant1.email}, ${tenant2.email} (password: "Password123!")`,
  );
  console.log(
    "  3 categories, 3 properties, 4 rental requests, 2 payments, 1 review",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
