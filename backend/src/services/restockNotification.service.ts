import {
  User,
} from "../models/user.model.js";

import {
  Notification,
} from "../models/notification.model.js";


export const notifyProductRestocked =
  async (
    productId: string,
    productName: string
  ) => {
    const customers =
      await User.find({
        role: "customer",

        isActive: true,

        favoriteProducts:
          productId,
      }).select("_id");


    if (
      customers.length ===
      0
    ) {
      return;
    }


    const notifications =
      customers.map(
        (customer) => ({
          user:
            customer._id,

          title:
            "Favorite product restocked",

          message:
            `${productName} is available again.`,

          type:
            "stock" as const,

          isRead:
            false,
        })
      );


    await Notification.insertMany(
      notifications
    );
  };