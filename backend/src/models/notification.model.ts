import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;

  title: string;
  message: string;

  type:
    | "order"
    | "stock"
    | "announcement"
    | "system";

  relatedOrder?: mongoose.Types.ObjectId;

  isRead: boolean;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "order",
        "stock",
        "announcement",
        "system",
      ],
      default: "system",
    },

    relatedOrder: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

notificationSchema.index({
  user: 1,
  isRead: 1,
});

export const Notification =
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  );