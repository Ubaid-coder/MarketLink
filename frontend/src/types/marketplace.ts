export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Market {
  _id: string;
  name: string;
  address: string;

  operatingDays: string[];

  openingTime: string;
  closingTime: string;

  latitude: number;
  longitude: number;

  isActive?: boolean;
}

export interface PickupWindow {
  startTime: string;
  endTime: string;
}

export interface MarketSchedule {
  market: Market;

  operatingDays: string[];

  pickupWindows: PickupWindow[];

  stallLocation?: {
    description?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface Farmer {
  _id: string;

  stallName: string;
  contactPerson: string;

  description?: string;
  image?: string;

  approvalStatus:
    | "pending"
    | "approved"
    | "suspended";

  marketSchedules: MarketSchedule[];

  orderCutoffHours?: number;
}

export interface Product {
  _id: string;

  name: string;
  description?: string;

  price: number;
  unit: string;

  quantityAvailable: number;

  image?: string;

  status:
    | "available"
    | "sold_out"
    | "unavailable";

  category: Category;

  farmer: Farmer;

  isActive: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartGroup {
  farmer: Farmer;
  items: CartItem[];
}