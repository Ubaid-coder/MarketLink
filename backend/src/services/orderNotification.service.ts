import {
  Notification,
} from "../models/notification.model.js";


export const createOrderStatusNotification =
  async ({
    customerId,
    orderId,
    status,
  }: {
    customerId: string;
    orderId: string;
    status: string;
  }) => {
    let title = "";
    let message = "";


    switch (status) {
      case "accepted":
        title =
          "Order Accepted";

        message =
          "Your preorder has been accepted by the farmer.";

        break;


      case "declined":
        title =
          "Order Declined";

        message =
          "The farmer could not accept your preorder.";

        break;


      case "ready":
        title =
          "Order Ready for Pickup";

        message =
          "Your preorder is ready. You can collect it during your selected pickup window.";

        break;


      case "completed":
        title =
          "Order Completed";

        message =
          "Your preorder has been completed. You can now leave a review.";

        break;


      default:
        return;
    }


    await Notification.create({
      user:
        customerId,

      title,

      message,

      type: "order",

      relatedOrder:
        orderId,

      isRead: false,
    });
  };