export type NotificationType =
  | "order"
  | "stock"
  | "announcement"
  | "system";


export interface Notification {
  _id: string;

  title: string;

  message: string;

  type:
    | "order"
    | "stock"
    | "announcement"
    | "system";

  relatedOrder?:
    | string
    | {
        _id: string;
      };

  relatedProduct?:
    | string
    | {
        _id: string;
      };

  isRead: boolean;

  createdAt: string;

  updatedAt?: string;
}