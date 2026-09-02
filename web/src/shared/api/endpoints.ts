/**
 * Single registry of every Rentora API path.
 * Mirrors API_DOCUMENTATION.md — change a route here, nowhere else.
 */
export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    me: "/auth/me",
  },

  categories: {
    list: "/categories",
    create: "/categories",
  },

  properties: {
    list: "/properties",
    detail: (id: string) => `/properties/${id}`,
  },

  landlord: {
    properties: "/landlord/properties",
    property: (id: string) => `/landlord/properties/${id}`,
    requests: "/landlord/requests",
    request: (id: string) => `/landlord/requests/${id}`,
  },

  rentals: {
    list: "/rentals",
    create: "/rentals",
    detail: (id: string) => `/rentals/${id}`,
  },

  reviews: {
    create: "/reviews",
  },

  payments: {
    create: "/payments/create",
    list: "/payments",
    detail: (id: string) => `/payments/${id}`,
  },

  admin: {
    users: "/admin/users",
    user: (id: string) => `/admin/users/${id}`,
    properties: "/admin/properties",
    rentals: "/admin/rentals",
  },
} as const;
