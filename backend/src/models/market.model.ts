import mongoose, { Schema, Document } from "mongoose";

export interface IMarket extends Document {
  name: string;
  address: string;

  operatingDays: string[];

  openingTime: string;
  closingTime: string;

  latitude: number;
  longitude: number;

  isActive: boolean;
}

const marketSchema = new Schema<IMarket>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
    },

    operatingDays: [
      {
        type: String,
        required: true,
      },
    ],

    openingTime: {
      type: String,
      required: true,
    },

    closingTime: {
      type: String,
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
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

export const Market = mongoose.model<IMarket>("Market", marketSchema);