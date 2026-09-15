import type { Role } from "@/shared/types";

export interface NavItem {
  href: string;
  label: string;
  /** Two-digit index rendered as a Swiss section marker. */
  index: string;
}

export const SITE = {
  name: "Rentora",
  tagline: "Rental housing, listed plainly.",
} as const;

export const PUBLIC_NAV: NavItem[] = [
  { href: "/properties", label: "Listings", index: "01" },
  { href: "/#how", label: "How it works", index: "02" },
  { href: "/#coverage", label: "Coverage", index: "03" },
];

export const ROLE_NAV: Record<Role, NavItem[]> = {
  TENANT: [
    { href: "/tenant", label: "Overview", index: "01" },
    { href: "/tenant/rentals", label: "Rentals", index: "02" },
    { href: "/tenant/payments", label: "Payments", index: "03" },
    { href: "/properties", label: "Browse", index: "04" },
  ],
  LANDLORD: [
    { href: "/landlord", label: "Overview", index: "01" },
    { href: "/landlord/properties", label: "Properties", index: "02" },
    { href: "/landlord/requests", label: "Requests", index: "03" },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview", index: "01" },
    { href: "/admin/users", label: "Users", index: "02" },
    { href: "/admin/properties", label: "Properties", index: "03" },
    { href: "/admin/rentals", label: "Rentals", index: "04" },
    { href: "/admin/categories", label: "Categories", index: "05" },
  ],
};

export const ROLE_HOME: Record<Role, string> = {
  TENANT: "/tenant",
  LANDLORD: "/landlord",
  ADMIN: "/admin",
};

export const ROLE_LABEL: Record<Role, string> = {
  TENANT: "Tenant",
  LANDLORD: "Landlord",
  ADMIN: "Administrator",
};
