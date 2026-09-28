export type OrderStatus =
  | "placed"
  | "accepted"
  | "declined"
  | "ready"
  | "completed"
  | "cancelled";

export interface CreateOrderItem {
  product: string;
  quantity: number;
}

export interface CreateOrderPayload {
  farmer: string;
  market: string;

  items: CreateOrderItem[];

  pickupDate: string;

  pickupSlot: {
    startTime: string;
    endTime: string;
  };

  customerNote?: string;
}

import {
  Farmer,
  Market,
} from "@/types/marketplace";

export interface OrderItem {
  product:
  | string
  | {
    _id: string;
    name?: string;
    image?: string;
  };

  name: string;

  price: number;

  unit: string;

  quantity: number;

  subtotal: number;
}

export interface Order {
  _id: string;

  customer:
    | string
    | OrderCustomer;

  farmer: Farmer;

  market: Market;

  items: OrderItem[];

  totalAmount: number;

  pickupDate: string;

  pickupSlot: {
    startTime: string;
    endTime: string;
  };

  status: OrderStatus;

  customerNote?: string;

  cancellationReason?: string;

  cancelledBy?:
    | "customer"
    | "farmer";

  createdAt: string;

  updatedAt: string;
}

export interface ModifyOrderItem {
  product: string;
  quantity: number;
}

export interface ModifyOrderPayload {
  items: ModifyOrderItem[];
}

export interface CreateReviewPayload {
  order: string;

  farmer?: string;
  product?: string;

  rating: number;
  comment?: string;
}

export interface Review {
  _id: string;

  customer:
  | string
  | {
    _id: string;
    name: string;
  };

  order: string;

  farmer?: string;

  product?:
  | string
  | {
    _id: string;
    name: string;
  };

  rating: number;

  comment?: string;

  farmerResponse?: string;

  isVisible: boolean;

  createdAt: string;
}

export interface OrderCustomer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}