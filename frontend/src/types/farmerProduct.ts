import {
  Category,
} from "@/types/marketplace";


export type ProductStatus =
  | "available"
  | "sold_out"
  | "unavailable";


export interface WeeklyStockTemplate {
  enabled: boolean;
  defaultQuantity: number;
}


export interface FarmerProduct {
  _id: string;

  name: string;

  description?: string;

  price: number;

  unit: string;

  quantityAvailable: number;

  image?: string;

  status: ProductStatus;

  isActive: boolean;

  category:
    | Category
    | string;

  weeklyStockTemplate: WeeklyStockTemplate;

  createdAt?: string;

  updatedAt?: string;
}


export interface FarmerProductFormData {
  name: string;

  category: string;

  description: string;

  price: string;

  unit: string;

  quantityAvailable: string;

  image: string;

  weeklyStockEnabled: boolean;

  weeklyDefaultQuantity: string;
}