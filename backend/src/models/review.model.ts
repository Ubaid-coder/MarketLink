import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IReview
  extends Document {
  customer: mongoose.Types.ObjectId;

  order: mongoose.Types.ObjectId;

  farmer?: mongoose.Types.ObjectId;

  product?: mongoose.Types.ObjectId;

  rating: number;

  comment?: string;

  farmerResponse?: string;

  isVisible: boolean;
}

const reviewSchema =
  new Schema<IReview>(
    {
      customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },

      farmer: {
        type: Schema.Types.ObjectId,
        ref: "FarmerProfile",
      },

      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },

      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      comment: {
        type: String,
        trim: true,
      },

      farmerResponse: {
        type: String,
        trim: true,
      },

      isVisible: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

reviewSchema.index({
  farmer: 1,
  createdAt: -1,
});

reviewSchema.index({
  product: 1,
  createdAt: -1,
});

export const Review =
  mongoose.model<IReview>(
    "Review",
    reviewSchema
  );