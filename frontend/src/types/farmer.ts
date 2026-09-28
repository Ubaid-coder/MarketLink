export interface FarmerDashboardStats {
  totalProducts: number;
  totalOrders: number;

  placedOrders: number;
  acceptedOrders: number;
  readyOrders: number;
  completedOrders: number;

  totalRevenue: number;

  bestSellingProducts: BestSellingProduct[];
}

export interface BestSellingProduct {
  productId?: string;
  name: string;
  quantitySold: number;
  revenue?: number;
}