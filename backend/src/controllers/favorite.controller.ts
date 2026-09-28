import { Response } from "express";
import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";


// ======================================================
// GET FAVORITES
// ======================================================

export const getFavorites = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = await User.findById(
      req.user!.userId
    )
      .populate({
        path: "favoriteProducts",
        match: {
          isActive: true,
        },
        populate: [
          {
            path: "category",
            select: "name",
          },
          {
            path: "farmer",
            select: "stallName image",
          },
        ],
      })
      .populate({
        path: "favoriteFarmers",
        match: {
          approvalStatus: "approved",
        },
        select:
          "stallName description image marketSchedules",
        populate: {
          path: "marketSchedules.market",
          select: "name address",
        },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,

      favoriteProducts:
        user.favoriteProducts,

      favoriteFarmers:
        user.favoriteFarmers,
    });
  } catch (error) {
    console.error(
      "Get favorites error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// TOGGLE FAVORITE PRODUCT
// ======================================================

export const toggleFavoriteProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { productId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(
      req.user!.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const index =
      user.favoriteProducts.findIndex(
        (id) =>
          id.toString() === productId
      );

    let favorited: boolean;

    if (index === -1) {
      user.favoriteProducts.push(
        product._id
      );

      favorited = true;
    } else {
      user.favoriteProducts.splice(
        index,
        1
      );

      favorited = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      favorited,

      message: favorited
        ? "Product added to favorites"
        : "Product removed from favorites",
    });
  } catch (error) {
    console.error(
      "Favorite product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// TOGGLE FAVORITE FARMER
// ======================================================

export const toggleFavoriteFarmer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { farmerId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        farmerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid farmer ID",
      });
    }

    const farmer =
      await FarmerProfile.findOne({
        _id: farmerId,
        approvalStatus: "approved",
      });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    const user = await User.findById(
      req.user!.userId
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const index =
      user.favoriteFarmers.findIndex(
        (id) =>
          id.toString() === farmerId
      );

    let favorited: boolean;

    if (index === -1) {
      user.favoriteFarmers.push(
        farmer._id
      );

      favorited = true;
    } else {
      user.favoriteFarmers.splice(
        index,
        1
      );

      favorited = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      favorited,

      message: favorited
        ? "Farmer added to favorites"
        : "Farmer removed from favorites",
    });
  } catch (error) {
    console.error(
      "Favorite farmer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};