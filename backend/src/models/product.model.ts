import mongoose, { Schema, Document } from "mongoose";

interface IWeeklyStockTemplate {
  enabled: boolean;
  defaultQuantity: number;
}

export interface IProduct extends Document {
  farmer: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;

  name: string;
  description?: string;

  price: number;
  unit: string;

  quantityAvailable: number;

  image?: string;

  status: "available" | "sold_out" | "unavailable";

  weeklyStockTemplate: IWeeklyStockTemplate;

  isActive: boolean;
}

const weeklyStockTemplateSchema = new Schema<IWeeklyStockTemplate>(
  {
    enabled: {
      type: Boolean,
      default: false,
    },

    defaultQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const productSchema = new Schema<IProduct>(
  {
    farmer: {
      type: Schema.Types.ObjectId,
      ref: "FarmerProfile",
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    quantityAvailable: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    image: {
      type: String,
    },

    status: {
      type: String,
      enum: ["available", "sold_out", "unavailable"],
      default: "available",
    },

    weeklyStockTemplate: {
      type: weeklyStockTemplateSchema,
      default: () => ({
        enabled: false,
        defaultQuantity: 0,
      }),
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search
productSchema.index({
  name: "text",
  description: "text",
});

// Filtering
productSchema.index({ farmer: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });

export const Product = mongoose.model<IProduct>(
  "Product",
  productSchema
);