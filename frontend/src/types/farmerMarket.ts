import {
  Market,
} from "@/types/marketplace";


export interface FarmerPickupWindow {
  startTime: string;
  endTime: string;
}


export interface FarmerStallLocation {
  description?: string;
  latitude?: number;
  longitude?: number;
}


export interface FarmerMarketSchedule {
  market: Market;

  operatingDays: string[];

  pickupWindows: FarmerPickupWindow[];

  stallLocation?: FarmerStallLocation;
}


export interface FarmerMarketFormData {
  marketId: string;

  operatingDays: string[];

  pickupWindows: FarmerPickupWindow[];

  stallDescription: string;

  latitude: string;

  longitude: string;
}