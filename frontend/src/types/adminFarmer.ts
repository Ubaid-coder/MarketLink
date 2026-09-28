import { Market } from "@/types/marketplace";

export type FarmerApprovalStatus =
  | "pending"
  | "approved"
  | "suspended";

export interface AdminFarmerUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminFarmerMarketSchedule {
  market: Market | string;

  operatingDays: string[];

  pickupWindows: {
    startTime: string;
    endTime: string;
  }[];

  stallLocation?: {
    description?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface AdminFarmer {
  _id: string;

  user:
    | AdminFarmerUser
    | string;

  stallName: string;

  contactPerson: string;

  description?: string;

  image?: string;

  approvalStatus:
    FarmerApprovalStatus;

  orderCutoffHours: number;

  marketSchedules:
    AdminFarmerMarketSchedule[];

  createdAt?: string;
  updatedAt?: string;
}