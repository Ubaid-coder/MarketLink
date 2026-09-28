import { Request, Response } from "express";
import mongoose from "mongoose";

import { Product } from "../models/product.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { Category } from "../models/category.model.js";
import { notifyProductRestocked } from "../services/restockNotification.service.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";


// ======================================================
// CREATE PRODUCT - FARMER
// ======================================================

export const createProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      name,
      category,
      description,
      price,
      unit,
      quantityAvailable,
      image,
      weeklyStockTemplate,
    } = req.body;

    if (
      !name ||
      !category ||
      price === undefined ||
      !unit ||
      quantityAvailable === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required product fields are missing",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    if (farmer.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your farmer account must be approved before adding products",
      });
    }

    /*
      A farmer without a market schedule technically has
      nowhere for the customer to collect the product.
    */
    if (farmer.marketSchedules.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one market schedule before creating products",
      });
    }

    const categoryExists = await Category.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Active category not found",
      });
    }

    const product = await Product.create({
      farmer: farmer._id,

      category,

      name: name.trim(),
      description,

      price,
      unit,

      quantityAvailable,

      image,

      weeklyStockTemplate: weeklyStockTemplate || {
        enabled: false,
        defaultQuantity: 0,
      },

      status:
        Number(quantityAvailable) > 0
          ? "available"
          : "sold_out",
    });

    await product.populate("category");

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET MY PRODUCTS - FARMER
// ======================================================

export const getMyProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    /*
      Farmer should see unavailable / sold-out products too,
      because they need to manage them.
    */
    const products = await Product.find({
      farmer: farmer._id,
      isActive: true,
    })
      .populate("category", "name")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get farmer products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET MY SINGLE PRODUCT - FARMER
// ======================================================

export const getMyProductById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      farmer: farmer._id,
      isActive: true,
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE MY PRODUCT - FARMER
// ======================================================

export const updateProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      farmer: farmer._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const wasOutOfStock =
      product.quantityAvailable === 0 ||
      product.status === "sold_out";

    const {
      name,
      category,
      description,
      price,
      unit,
      quantityAvailable,
      image,
      weeklyStockTemplate,
    } = req.body;

    if (category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists = await Category.findOne({
        _id: category,
        isActive: true,
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Active category not found",
        });
      }

      product.category = category;
    }

    if (name !== undefined) {
      product.name = name.trim();
    }

    if (description !== undefined) {
      product.description = description;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (unit !== undefined) {
      product.unit = unit;
    }

    if (image !== undefined) {
      product.image = image;
    }

    if (weeklyStockTemplate !== undefined) {
      product.weeklyStockTemplate =
        weeklyStockTemplate;
    }

    if (quantityAvailable !== undefined) {
      product.quantityAvailable =
        quantityAvailable;

      /*
       Only automatically change between available/sold-out.

       We don't override "unavailable", because unavailable
       is a deliberate farmer decision.
      */

      if (product.status !== "unavailable") {
        product.status =
          Number(quantityAvailable) > 0
            ? "available"
            : "sold_out";
      }
    }

    if (product.quantityAvailable === 0) {
      product.status = "sold_out";
    }

    if (
      product.quantityAvailable > 0 &&
      product.status === "sold_out"
    ) {
      product.status = "available";
    }

    await product.save();

    const isNowAvailable =
      product.quantityAvailable > 0 &&
      product.status === "available";

    if (wasOutOfStock && isNowAvailable) {
      await notifyProductRestocked(
        product._id.toString(),
        product.name
      );
    }

    await product.populate(
      "category",
      "name"
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// CHANGE AVAILABILITY - FARMER
// ======================================================

export const updateProductStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.body;

    if (
      !["available", "sold_out", "unavailable"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product status",
      });
    }

    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      farmer: farmer._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
      Don't allow "available" when stock is zero.
    */
    if (
      status === "available" &&
      product.quantityAvailable <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product cannot be available with zero stock",
      });
    }

    product.status = status;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product status updated",
      product,
    });
  } catch (error) {
    console.error("Update product status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// RESET PRODUCT TO WEEKLY STOCK
// ======================================================

export const resetWeeklyStock = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      farmer: farmer._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.weeklyStockTemplate.enabled) {
      return res.status(400).json({
        success: false,
        message:
          "Weekly stock template is not enabled for this product",
      });
    }

    const wasOutOfStock =
      product.quantityAvailable === 0 ||
      product.status === "sold_out";

    if (product.quantityAvailable > 0) {
      product.status = "available";
    } else {
      product.status = "sold_out";
    }

    product.quantityAvailable =
      product.weeklyStockTemplate.defaultQuantity;

    product.status =
      product.quantityAvailable > 0
        ? "available"
        : "sold_out";

    await product.save();
    const isNowAvailable =
      product.quantityAvailable > 0 &&
      product.status === "available";

    if (wasOutOfStock && isNowAvailable) {
      await notifyProductRestocked(
        product._id.toString(),
        product.name
      );
    }
    return res.status(200).json({
      success: true,
      message: "Weekly stock reset successfully",
      product,
    });
  } catch (error) {
    console.error("Reset weekly stock error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// DELETE PRODUCT - FARMER
// ======================================================

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      farmer: farmer._id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
      Soft delete because completed/historical orders may
      eventually reference this product.
    */

    product.isActive = false;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};