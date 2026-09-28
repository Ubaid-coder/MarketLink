import mongoose, {
  Schema,
  Document,
} from "mongoose";

interface IOrderItem {
  product: mongoose.Types.ObjectId;

  name: string;

  price: number;

  unit: string;

  quantity: number;

  subtotal: number;
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;

  farmer: mongoose.Types.ObjectId;

  market: mongoose.Types.ObjectId;

  items: IOrderItem[];

  totalAmount: number;

  pickupDate: Date;

  pickupSlot: {
    startTime: string;
    endTime: string;
  };

  status:
    | "placed"
    | "accepted"
    | "declined"
    | "ready"
    | "completed"
    | "cancelled";

  customerNote?: string;

  cancellationReason?: string;

  cancelledBy?: "customer" | "farmer";
}

const orderItemSchema =
  new Schema<IOrderItem>(
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      price: {
        type: Number,
        required: true,
      },

      unit: {
        type: String,
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
        min: 1,
      },

      subtotal: {
        type: Number,
        required: true,
      },
    },
    {
      _id: false,
    }
  );

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farmer: {
      type: Schema.Types.ObjectId,
      ref: "FarmerProfile",
      required: true,
    },

    market: {
      type: Schema.Types.ObjectId,
      ref: "Market",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    pickupDate: {
      type: Date,
      required: true,
    },

    pickupSlot: {
      startTime: {
        type: String,
        required: true,
      },

      endTime: {
        type: String,
        required: true,
      },
    },

    status: {
      type: String,

      enum: [
        "placed",
        "accepted",
        "declined",
        "ready",
        "completed",
        "cancelled",
      ],

      default: "placed",
    },

    customerNote: {
      type: String,
    },

    cancellationReason: {
      type: String,
    },

    cancelledBy: {
      type: String,
      enum: ["customer", "farmer"],
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  customer: 1,
  createdAt: -1,
});

orderSchema.index({
  farmer: 1,
  status: 1,
});

orderSchema.index({
  market: 1,
  pickupDate: 1,
});

export const Order =
  mongoose.model<IOrder>(
    "Order",
    orderSchema
  );