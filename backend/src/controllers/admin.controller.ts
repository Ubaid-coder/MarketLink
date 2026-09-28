import { Response } from "express";
import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Market } from "../models/market.model.js";


import { AuthRequest } from "../middlewares/auth.middleware.js";
import { Notification } from "../models/notification.model.js";
import { Review } from "../models/review.model.js";
// ======================================================
// GET ALL FARMERS
// ======================================================

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export const getAdminDashboard = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const [
      totalCustomers,
      totalFarmers,
      pendingFarmers,
      totalMarkets,
      totalProducts,
      totalOrders,
      completedOrders,
      pendingOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({
        role: "customer",
      }),

      User.countDocuments({
        role: "farmer",
      }),

      FarmerProfile.countDocuments({
        approvalStatus: "pending",
      }),

      Market.countDocuments({
        isActive: true,
      }),

      Product.countDocuments({
        isActive: true,
      }),

      Order.countDocuments(),

      Order.countDocuments({
        status: "completed",
      }),

      Order.countDocuments({
        status: {
          $in: [
            "placed",
            "accepted",
            "ready",
          ],
        },
      }),

      Order.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult[0]?.total || 0;

    return res.status(200).json({
      success: true,

      dashboard: {
        totalCustomers,
        totalFarmers,
        pendingFarmers,
        totalMarkets,
        totalProducts,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// ADMIN - GET CUSTOMERS
// ======================================================

export const getCustomers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { search, status } =
      req.query;

    const filter: any = {
      role: "customer",
    };

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const customers =
      await User.find(filter)
        .select(
          "name email phone address isActive createdAt"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error(
      "Get customers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// ADMIN - ACTIVATE / DEACTIVATE CUSTOMER
// ======================================================

export const toggleCustomerStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const customer =
      await User.findOne({
        _id: req.params.id,
        role: "customer",
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found",
      });
    }

    customer.isActive =
      !customer.isActive;

    await customer.save();

    return res.status(200).json({
      success: true,

      message: customer.isActive
        ? "Customer activated"
        : "Customer deactivated",

      customer,
    });
  } catch (error) {
    console.error(
      "Customer status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// ADMIN - GET PRODUCTS
// ======================================================

export const getAdminProducts = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const products =
      await Product.find()
        .populate(
          "category",
          "name"
        )
        .populate(
          "farmer",
          "stallName approvalStatus"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Admin products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// ADMIN - PRODUCT MODERATION
// ======================================================

export const toggleProductStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    product.isActive =
      !product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,

      message: product.isActive
        ? "Product activated"
        : "Product hidden",

      product,
    });
  } catch (error) {
    console.error(
      "Product moderation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// ADMIN - REPORTS
// ======================================================

export const getAdminReports = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const [
      orderStatusStats,
      revenueStats,
      activeFarmers,
    ] = await Promise.all([

      // ORDERS BY STATUS
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: {
              $sum: 1,
            },
          },
        },
      ]),

      // TOTAL COMPLETED REVENUE
      Order.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum: "$totalAmount",
            },

            averageOrderValue: {
              $avg: "$totalAmount",
            },
          },
        },
      ]),

      // MOST ACTIVE FARMERS
      Order.aggregate([
        {
          $group: {
            _id: "$farmer",

            totalOrders: {
              $sum: 1,
            },

            completedOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "completed",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            totalOrders: -1,
          },
        },

        {
          $limit: 10,
        },

        {
          $lookup: {
            from: "farmerprofiles",
            localField: "_id",
            foreignField: "_id",
            as: "farmer",
          },
        },

        {
          $unwind: "$farmer",
        },

        {
          $project: {
            _id: 1,
            totalOrders: 1,
            completedOrders: 1,
            stallName:
              "$farmer.stallName",
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,

      reports: {
        orderStatusStats,

        totalRevenue:
          revenueStats[0]
            ?.totalRevenue || 0,

        averageOrderValue:
          revenueStats[0]
            ?.averageOrderValue || 0,

        activeFarmers,
      },
    });
  } catch (error) {
    console.error(
      "Reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllFarmers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.query;

    const filter: any = {};

    if (
      status &&
      ["pending", "approved", "suspended"].includes(
        status as string
      )
    ) {
      filter.approvalStatus = status;
    }

    const farmers = await FarmerProfile.find(filter)
      .populate(
        "user",
        "name email phone address isActive createdAt"
      )
      .populate(
        "marketSchedules.market",
        "name address operatingDays openingTime closingTime"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error("Get farmers error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET SINGLE FARMER
// ======================================================

export const getFarmerById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findById(
      req.params.id
    )
      .populate(
        "user",
        "name email phone address isActive createdAt"
      )
      .populate("marketSchedules.market");

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    return res.status(200).json({
      success: true,
      farmer,
    });
  } catch (error) {
    console.error("Get farmer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// APPROVE FARMER
// ======================================================

export const approveFarmer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findById(
      req.params.id
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    farmer.approvalStatus = "approved";

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer approved successfully",
      farmer,
    });
  } catch (error) {
    console.error("Approve farmer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// SUSPEND FARMER
// ======================================================

export const suspendFarmer = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const farmer = await FarmerProfile.findById(
      req.params.id
    );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    farmer.approvalStatus = "suspended";

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer suspended successfully",
      farmer,
    });
  } catch (error) {
    console.error("Suspend farmer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const createAnnouncement = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      message,
      audience = "all",
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Title and message are required",
      });
    }

    const userFilter: any = {
      isActive: true,
    };

    if (audience === "customer") {
      userFilter.role = "customer";
    }

    if (audience === "farmer") {
      userFilter.role = "farmer";
    }

    const users = await User.find(
      userFilter
    ).select("_id");

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "No users found for this audience",
        sent: 0,
      });
    }

    await Notification.insertMany(
      users.map((user) => ({
        user: user._id,

        title,

        message,

        type: "announcement",
      }))
    );

    return res.status(201).json({
      success: true,

      message:
        "Announcement sent successfully",

      sent: users.length,
    });
  } catch (error) {
    console.error(
      "Announcement error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAdminReviews = async (
  req: Request,
  res: Response
) => {
  try {
    const reviews = await Review.find()
      .populate(
        "customer",
        "name email"
      )
      .populate(
        "farmer",
        "stallName contactPerson"
      )
      .populate(
        "product",
        "name image"
      )
      .populate(
        "order",
        "status totalAmount"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch reviews",
    });
  }
};

export const updateReviewVisibility =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { isVisible } =
        req.body;

      if (
        typeof isVisible !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isVisible must be boolean",
        });
      }

      const review =
        await Review.findById(
          req.params.id
        );

      if (!review) {
        return res.status(404).json({
          success: false,
          message:
            "Review not found",
        });
      }

      review.isVisible =
        isVisible;

      await review.save();

      return res.status(200).json({
        success: true,
        message: isVisible
          ? "Review restored"
          : "Review hidden",
        review,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          "Unable to update review",
      });
    }
  };