export interface ReviewCustomer {
  _id: string;
  name: string;
}

export interface Review {
  _id: string;

  customer:
    | string
    | ReviewCustomer;

  order: string;

  farmer?: string;

  product?: string;

  rating: number;

  comment?: string;

  farmerResponse?: string;

  isVisible: boolean;

  createdAt: string;
}