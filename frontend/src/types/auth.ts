export type UserRole =
  | "customer"
  | "farmer"
  | "admin";

export interface User {
  _id: string;

  name: string;

  email: string;

  phone: string;

  address: string;

  role: UserRole;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface FarmerProfile {
  _id: string;

  stallName: string;

  contactPerson: string;

  description?: string;

  image?: string;

  approvalStatus:
    | "pending"
    | "approved"
    | "suspended";

  orderCutoffHours?: number;
}