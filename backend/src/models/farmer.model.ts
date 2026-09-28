import mongoose, { Schema, Document } from "mongoose";

interface IPickupWindow {
  startTime: string;
  endTime: string;
}

interface IMarketSchedule {
  market: mongoose.Types.ObjectId;

  operatingDays: string[];

  pickupWindows: IPickupWindow[];

  stallLocation?: {
    description?: string;
    latitude?: number;
    longitude?: number;
  };
}

export interface IFarmerProfile extends Document {
  user: mongoose.Types.ObjectId;

  stallName: string;
  contactPerson: string;

  description?: string;
  image?: string;

  marketSchedules: IMarketSchedule[];

  orderCutoffHours: number;

  approvalStatus: "pending" | "approved" | "suspended";
}

const pickupWindowSchema = new Schema<IPickupWindow>(
  {
    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const marketScheduleSchema = new Schema<IMarketSchedule>(
  {
    market: {
      type: Schema.Types.ObjectId,
      ref: "Market",
      required: true,
    },

    operatingDays: [
      {
        type: String,
        required: true,
      },
    ],

    pickupWindows: {
      type: [pickupWindowSchema],
      default: [],
    },

    stallLocation: {
      description: {
        type: String,
      },

      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },
    },
  },
  {
    _id: false,
  }
);

const farmerSchema = new Schema<IFarmerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    stallName: {
      type: String,
      required: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    marketSchedules: {
      type: [marketScheduleSchema],
      default: [],
    },

    orderCutoffHours: {
      type: Number,
      default: 2,
      min: 0,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Useful when admin searches farmers by approval status
farmerSchema.index({ approvalStatus: 1 });

// Useful when finding farmers selling at a particular market
farmerSchema.index({ "marketSchedules.market": 1 });

export const FarmerProfile = mongoose.model<IFarmerProfile>(
  "FarmerProfile",
  farmerSchema
);