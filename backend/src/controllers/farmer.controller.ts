import { NextFunction, Response } from "express";
import mongoose from "mongoose";

import { FarmerProfile } from "../models/farmer.model.js";
import { Market } from "../models/market.model.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

// ======================================================
// GET MY FARMER PROFILE
// ======================================================

export const getMyFarmerProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    })
      .populate(
        "user",
        "name email phone address"
      )
      .populate(
        "marketSchedules.market",
        "name address operatingDays openingTime closingTime latitude longitude"
      );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      farmer,
    });
  } catch (error) {
    console.error("Get farmer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE BASIC FARMER PROFILE
// ======================================================

export const updateMyFarmerProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      stallName,
      contactPerson,
      description,
      image,
      orderCutoffHours,
    } = req.body;

    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    if (stallName !== undefined) {
      farmer.stallName = stallName;
    }

    if (contactPerson !== undefined) {
      farmer.contactPerson = contactPerson;
    }

    if (description !== undefined) {
      farmer.description = description;
    }

    if (image !== undefined) {
      farmer.image = image;
    }

    if (orderCutoffHours !== undefined) {
      farmer.orderCutoffHours = orderCutoffHours;
    }

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer profile updated successfully",
      farmer,
    });
  } catch (error) {
    console.error("Update farmer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// ADD MARKET SCHEDULE
// ======================================================

export const addMarketSchedule = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      marketId,
      operatingDays,
      pickupWindows,
      stallLocation,
    } = req.body;

    if (!marketId) {
      return res.status(400).json({
        success: false,
        message: "Market is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid market ID",
      });
    }

    if (
      !Array.isArray(operatingDays) ||
      operatingDays.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Operating days are required",
      });
    }

    if (
      !Array.isArray(pickupWindows) ||
      pickupWindows.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one pickup window is required",
      });
    }

    const market = await Market.findOne({
      _id: marketId,
      isActive: true,
    });

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Active market not found",
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

    // Important: suspended/pending farmers shouldn't configure selling
    if (farmer.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message:
          "Your farmer account must be approved before joining a market",
      });
    }

    const alreadyExists = farmer.marketSchedules.some(
      (schedule) =>
        schedule.market.toString() === marketId
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a schedule for this market",
      });
    }

    farmer.marketSchedules.push({
      market: new mongoose.Types.ObjectId(marketId),
      operatingDays,
      pickupWindows,
      stallLocation,
    });

    await farmer.save();

    await farmer.populate("marketSchedules.market");

    return res.status(201).json({
      success: true,
      message: "Market schedule added successfully",
      farmer,
    });
  } catch (error) {
    console.error("Add market schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE MARKET SCHEDULE
// ======================================================

export const updateMarketSchedule = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { marketId } = req.params;

    const {
      operatingDays,
      pickupWindows,
      stallLocation,
    } = req.body;

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
        message: "Farmer account is not approved",
      });
    }

    const schedule = farmer.marketSchedules.find(
      (item) =>
        item.market.toString() === marketId
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Market schedule not found",
      });
    }

    if (operatingDays !== undefined) {
      schedule.operatingDays = operatingDays;
    }

    if (pickupWindows !== undefined) {
      schedule.pickupWindows = pickupWindows;
    }

    if (stallLocation !== undefined) {
      schedule.stallLocation = stallLocation;
    }

    await farmer.save();

    await farmer.populate("marketSchedules.market");

    return res.status(200).json({
      success: true,
      message: "Market schedule updated successfully",
      farmer,
    });
  } catch (error) {
    console.error("Update market schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// REMOVE MARKET SCHEDULE
// ======================================================

export const removeMarketSchedule = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { marketId } = req.params;

    const farmer = await FarmerProfile.findOne({
      user: req.user!.userId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer profile not found",
      });
    }

    const scheduleExists = farmer.marketSchedules.some(
      (schedule) =>
        schedule.market.toString() === marketId
    );

    if (!scheduleExists) {
      return res.status(404).json({
        success: false,
        message: "Market schedule not found",
      });
    }

    farmer.marketSchedules = farmer.marketSchedules.filter(
      (schedule) =>
        schedule.market.toString() !== marketId
    );

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Market schedule removed successfully",
      farmer,
    });
  } catch (error) {
    console.error("Remove market schedule error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// FARMER DASHBOARD
// ======================================================

export const getFarmerDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
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

    const [
      totalProducts,
      totalOrders,
      placedOrders,
      acceptedOrders,
      readyOrders,
      completedOrders,
      revenueResult,
      bestSellingProducts,
    ] = await Promise.all([

      Product.countDocuments({
        farmer: farmer._id,
        isActive: true,
      }),

      Order.countDocuments({
        farmer: farmer._id,
      }),

      Order.countDocuments({
        farmer: farmer._id,
        status: "placed",
      }),

      Order.countDocuments({
        farmer: farmer._id,
        status: "accepted",
      }),

      Order.countDocuments({
        farmer: farmer._id,
        status: "ready",
      }),

      Order.countDocuments({
        farmer: farmer._id,
        status: "completed",
      }),

      Order.aggregate([
        {
          $match: {
            farmer:
              farmer._id,

            status:
              "completed",
          },
        },

        {
          $group: {
            _id: null,

            revenue: {
              $sum:
                "$totalAmount",
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            farmer:
              farmer._id,

            status:
              "completed",
          },
        },

        {
          $unwind:
            "$items",
        },

        {
          $group: {
            _id:
              "$items.product",

            name: {
              $first:
                "$items.name",
            },

            quantitySold: {
              $sum:
                "$items.quantity",
            },

            revenue: {
              $sum:
                "$items.subtotal",
            },
          },
        },

        {
          $sort: {
            quantitySold: -1,
          },
        },

        {
          $limit: 5,
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,

      dashboard: {
        totalProducts,
        totalOrders,

        pendingOrders:
          placedOrders,

        acceptedOrders,
        readyOrders,
        completedOrders,

        totalRevenue:
          revenueResult[0]
            ?.revenue || 0,

        bestSellingProducts,
      },
    });
  } catch (error) {
    console.error(
      "Farmer dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const requireApprovedFarmer =
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId =
        (req as any).user
          ?.userId ||
        (req as any).user
          ?._id;

      const farmer =
        await FarmerProfile.findOne({
          user: userId,
        });

      if (!farmer) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Farmer profile not found",
          });
      }


      if (
        farmer.approvalStatus !==
        "approved"
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message:
              farmer.approvalStatus ===
              "suspended"
                ? "Your farmer account is suspended"
                : "Your farmer account is awaiting approval",
          });
      }


      next();
    } catch (error) {
      next(error);
    }
  };