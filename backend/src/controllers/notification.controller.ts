import { Response } from "express";
import mongoose from "mongoose";

import { Notification } from "../models/notification.model.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";


// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const notifications =
      await Notification.find({
        user: req.user!.userId,
      })
        .populate(
          "relatedOrder",
          "status totalAmount pickupDate"
        )
        .sort({
          createdAt: -1,
        });

    const unreadCount =
      await Notification.countDocuments({
        user: req.user!.userId,
        isRead: false,
      });

    return res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// MARK ONE AS READ
// ======================================================

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          user: req.user!.userId,
        },
        {
          isRead: true,
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await Notification.updateMany(
      {
        user: req.user!.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};