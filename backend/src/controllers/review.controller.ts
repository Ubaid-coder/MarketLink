import { Request, Response } from "express";
import mongoose from "mongoose";

import { Review } from "../models/review.model.js";
import { Order } from "../models/order.model.js";
import { FarmerProfile } from "../models/farmer.model.js";

import { AuthRequest } from "../middlewares/auth.middleware.js";


// ======================================================
// CREATE PRODUCT REVIEW
// ======================================================

export const createProductReview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      orderId,
      productId,
      rating,
      comment,
    } = req.body;

    if (
      !orderId ||
      !productId ||
      !rating
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order, product and rating are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      ) ||
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const numericRating =
      Number(rating);

    if (
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }

    const order = await Order.findOne({
      _id: orderId,

      customer:
        req.user!.userId,

      status: "completed",
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message:
          "Only completed orders can be reviewed",
      });
    }

    const purchased =
      order.items.some(
        (item) =>
          String(item.product) ===
          String(productId)
      );


    if (!purchased) {
      return res.status(403).json({
        success: false,
        message:
          "You did not purchase this product in this order",
      });
    }

    const existingReview =
      await Review.findOne({
        customer:
          req.user!.userId,

        order: order._id,

        product: productId,
      });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message:
          "You already reviewed this product for this order",
      });
    }

    const review =
      await Review.create({
        customer:
          req.user!.userId,

        order: order._id,

        farmer: order.farmer,

        product: productId,

        rating: numericRating,

        comment,
      });

    await review.populate(
      "customer",
      "name"
    );

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error(
      "Create review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET PRODUCT REVIEWS - PUBLIC
// ======================================================

export const getProductReviews = async (
  req: Request,
  res: Response
) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isVisible: true,
    })
      .populate(
        "customer",
        "name"
      )
      .sort({
        createdAt: -1,
      });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        ) / reviews.length
        : 0;

    return res.status(200).json({
      success: true,

      count: reviews.length,

      averageRating:
        Number(
          averageRating.toFixed(1)
        ),

      reviews,
    });
  } catch (error) {
    console.error(
      "Get reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET FARMER REVIEWS - PUBLIC
// ======================================================

export const getFarmerReviews = async (
  req: Request,
  res: Response
) => {
  try {
    const reviews = await Review.find({
      farmer: req.params.farmerId,
      isVisible: true,
    })
      .populate(
        "customer",
        "name"
      )
      .populate(
        "product",
        "name image"
      )
      .sort({
        createdAt: -1,
      });

    const averageRating =
      reviews.length
        ? reviews.reduce(
          (total, review) =>
            total + review.rating,
          0
        ) / reviews.length
        : 0;

    return res.status(200).json({
      success: true,

      count: reviews.length,

      averageRating:
        Number(
          averageRating.toFixed(1)
        ),

      reviews,
    });
  } catch (error) {
    console.error(
      "Farmer reviews error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const respondToReview = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { response } = req.body;

    if (!response?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Response is required",
      });
    }

    const farmer =
      await FarmerProfile.findOne({
        user: req.user!.userId,
      });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message:
          "Farmer profile not found",
      });
    }

    const review =
      await Review.findOne({
        _id: req.params.id,
        farmer: farmer._id,
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.farmerResponse =
      response.trim();

    await review.save();

    return res.status(200).json({
      success: true,
      message:
        "Response added successfully",
      review,
    });
  } catch (error) {
    console.error(
      "Review response error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const toggleReviewVisibility = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const review =
      await Review.findById(
        req.params.id
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.isVisible =
      !review.isVisible;

    await review.save();

    return res.status(200).json({
      success: true,

      message: review.isVisible
        ? "Review is now visible"
        : "Review hidden",

      review,
    });
  } catch (error) {
    console.error(
      "Moderate review error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};