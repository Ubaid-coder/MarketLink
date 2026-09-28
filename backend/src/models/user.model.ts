import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;

  role: "customer" | "farmer" | "admin";

  isActive: boolean;

  favoriteProducts: mongoose.Types.ObjectId[];
  favoriteFarmers: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "farmer", "admin"],
      default: "customer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    favoriteProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    favoriteFarmers: [
      {
        type: Schema.Types.ObjectId,
        ref: "FarmerProfile",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);