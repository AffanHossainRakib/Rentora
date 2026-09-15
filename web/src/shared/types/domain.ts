export type Role = "TENANT" | "LANDLORD" | "ADMIN";

export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type PaymentProvider = "STRIPE" | "SSLCOMMERZ";

export interface Profile {
  id: string;
  userId: string;
  profilePicture?: string | null;
  bio?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
  profile?: Profile | null;
}

export interface Category {
  id: string;
  name: string;
}

/** `category` arrives as the category *name*, not an id. */
export interface Property {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  isAvailable: boolean;
  location: string;
  price: number;
  category: string;
  amenities: string[];
  pictures: string[];
  createdAt?: string;
  user?: PropertyOwner;
  reviews?: Review[];
}

export type PropertyOwner = Pick<User, "id" | "name" | "email"> & {
  profile?: Profile | null;
};

export interface RentalRequest {
  id: string;
  userId: string;
  propertyId: string;
  status: RentalStatus;
  startDate: string;
  endDate: string;
  createdAt?: string;
  property?: Property;
  user?: Pick<User, "id" | "name" | "email">;
  payments?: Payment[];
  review?: Review | null;
}

export interface Payment {
  id: string;
  rentalRequestId: string;
  status: PaymentStatus;
  transactionId?: string | null;
  amount: number;
  method?: string | null;
  provider: PaymentProvider;
  currency: string;
  paidAt?: string | null;
  createdAt?: string;
  rentalRequest?: RentalRequest;
}

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  userId: string;
  propertyId: string;
  rentalRequestId: string;
  rating: Rating;
  review: string;
  createdAt?: string;
  user?: Pick<User, "id" | "name">;
  property?: Pick<Property, "id" | "title">;
}
