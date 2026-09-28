import { Response } from "express";
import mongoose from "mongoose";

import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { Market } from "../models/market.model.js";

import { AuthRequest } from "../middlewares/auth.middleware.js";
import { Notification } from "../models/notification.model.js";
import { createOrderStatusNotification } from "../services/orderNotification.service.js";


// ======================================================
// CREATE PREORDER - CUSTOMER
// ======================================================

export const createOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    console.log(
      "CREATE ORDER BODY:",
      JSON.stringify(req.body, null, 2)
    );

    console.log(
      "CREATE ORDER USER:",
      req.user
    );

    const {
      farmer,
      market,
      items,
      pickupDate,
      pickupSlot,
      customerNote,
    } = req.body;

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (
      !farmer ||
      !market ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !pickupDate ||
      !pickupSlot?.startTime ||
      !pickupSlot?.endTime
    ) {
      console.log("MISSING ORDER DATA:", {
        farmer,
        market,
        items,
        pickupDate,
        pickupSlot,
      });

      return res.status(400).json({
        success: false,
        message:
          "Required order fields are missing",
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        farmer
      ) ||
      !mongoose.Types.ObjectId.isValid(
        market
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid farmer or market ID",
      });
    }

    // =====================================================
    // FARMER
    // =====================================================

    const Findfarmer =
      await FarmerProfile.findOne({
        _id: farmer,
        approvalStatus: "approved",
      });

    if (!Findfarmer) {
      return res.status(404).json({
        success: false,
        message:
          "Approved farmer not found",
      });
    }

    // =====================================================
    // MARKET
    // =====================================================

    const Findmarket =
      await Market.findOne({
        _id: market,
        isActive: true,
      });

    if (!Findmarket) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    // =====================================================
    // FARMER MUST OPERATE AT MARKET
    // =====================================================

    const marketSchedule =
      Findfarmer.marketSchedules.find(
        (schedule) =>
          schedule.market.toString() ===
          market
      );

    if (!marketSchedule) {
      return res.status(400).json({
        success: false,
        message:
          "Farmer does not operate at this market",
      });
    }

    // =====================================================
    // PICKUP DATE
    // =====================================================

    // Avoid YYYY-MM-DD timezone problems.
    const selectedDate = new Date(
      `${pickupDate}T12:00:00`
    );

    if (
      Number.isNaN(
        selectedDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup date",
      });
    }

    const now = new Date();

    // Compare calendar dates, not current time vs midnight.
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const selectedDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );

    if (selectedDay < today) {
      return res.status(400).json({
        success: false,
        message:
          "Pickup date cannot be in the past",
      });
    }

    const pickupDay =
      selectedDate.toLocaleDateString(
        "en-US",
        {
          weekday: "long",
        }
      );

    // Farmer must operate on selected day.
    const operatesOnDay =
      marketSchedule.operatingDays.some(
        (day) =>
          day.toLowerCase() ===
          pickupDay.toLowerCase()
      );

    if (!operatesOnDay) {
      return res.status(400).json({
        success: false,
        message: `Farmer does not operate at this market on ${pickupDay}`,
      });
    }

    // =====================================================
    // PICKUP SLOT
    // =====================================================

    const validPickupSlot =
      marketSchedule.pickupWindows.some(
        (window) =>
          window.startTime ===
            pickupSlot.startTime &&
          window.endTime ===
            pickupSlot.endTime
      );

    if (!validPickupSlot) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pickup slot",
      });
    }

    // =====================================================
    // ORDER CUTOFF
    // =====================================================

    const [hours, minutes] =
      pickupSlot.startTime
        .split(":")
        .map(Number);

    const pickupDateTime = new Date(
      selectedDate
    );

    pickupDateTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    // IMPORTANT:
    // use Findfarmer, NOT farmer
    const cutoffTime = new Date(
      pickupDateTime.getTime() -
        Findfarmer.orderCutoffHours *
          60 *
          60 *
          1000
    );

    if (now >= cutoffTime) {
      return res.status(400).json({
        success: false,
        message:
          "Order cutoff time has passed for this pickup slot",
      });
    }

    // =====================================================
    // BUILD ORDER ITEMS
    // =====================================================

    const orderItems: any[] = [];

    let totalAmount = 0;

    for (const item of items) {
      /*
       * FRONTEND SENDS:
       *
       * {
       *   product: "...",
       *   quantity: 2
       * }
       *
       * NOT productId.
       */

      if (
        !item.product ||
        !mongoose.Types.ObjectId.isValid(
          item.product
        ) ||
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        console.log(
          "INVALID ORDER ITEM:",
          item
        );

        return res.status(400).json({
          success: false,
          message:
            "Invalid order item",
        });
      }

      const product =
        await Product.findOne({
          _id: item.product,

          // IMPORTANT:
          // farmer is already the ObjectId string
          farmer: farmer,

          isActive: true,
          status: "available",
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "One or more products are unavailable",
        });
      }

      const quantity = Number(
        item.quantity
      );

      if (
        product.quantityAvailable <
        quantity
      ) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        });
      }

      const subtotal =
        product.price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity,
        subtotal,
      });

      totalAmount += subtotal;
    }

    // =====================================================
    // CREATE ORDER FIRST
    // =====================================================

    const order = await Order.create({
      customer: req.user.userId,

      // IMPORTANT:
      // these are IDs already
      farmer: Findfarmer._id,
      market: Findmarket._id,

      items: orderItems,

      totalAmount,

      pickupDate: selectedDate,

      pickupSlot: {
        startTime:
          pickupSlot.startTime,

        endTime:
          pickupSlot.endTime,
      },

      customerNote:
        customerNote?.trim() ||
        undefined,

      status: "placed",
    });

    // =====================================================
    // REDUCE STOCK
    // =====================================================

    for (const item of orderItems) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        continue;
      }

      product.quantityAvailable -=
        item.quantity;

      if (
        product.quantityAvailable <= 0
      ) {
        product.quantityAvailable = 0;
        product.status = "sold_out";
      }

      await product.save();
    }

    // =====================================================
    // POPULATE ORDER
    // =====================================================

    await order.populate([
      {
        path: "farmer",
        select:
          "stallName contactPerson",
      },
      {
        path: "market",
        select:
          "name address latitude longitude",
      },
      {
        path: "items.product",
        select:
          "name image",
      },
    ]);

    // =====================================================
    // FARMER NOTIFICATION
    // =====================================================

    await Notification.create({
      // IMPORTANT:
      // use Findfarmer.user
      user: Findfarmer.user,

      title: "New Preorder",

      message:
        "You have received a new customer preorder.",

      type: "order",

      relatedOrder: order._id,
    });

    // =====================================================
    // SUCCESS
    // =====================================================

    return res.status(201).json({
      success: true,
      message:
        "Preorder placed successfully",
      order,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// GET MY ORDERS - CUSTOMER
// ======================================================

export const getMyOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const orders = await Order.find({
      customer: req.user!.userId,
    })
      .populate(
        "farmer",
        "stallName image"
      )
      .populate(
        "market",
        "name address latitude longitude"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET MY SINGLE ORDER
// ======================================================

export const getMyOrderById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,

      customer:
        req.user!.userId,
    })
      .populate(
        "farmer",
        "stallName contactPerson image"
      )
      .populate(
        "market",
        "name address latitude longitude"
      )
      .populate(
        "items.product",
        "name image"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "Get order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// CANCEL ORDER - CUSTOMER
// ======================================================

export const cancelOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,

      customer:
        req.user!.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !["placed", "accepted"].includes(
        order.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order can no longer be cancelled",
      });
    }

    const farmer =
      await FarmerProfile.findById(
        order.farmer
      );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message:
          "Farmer not found",
      });
    }

    const [hours, minutes] =
      order.pickupSlot.startTime
        .split(":")
        .map(Number);

    const pickupDateTime =
      new Date(order.pickupDate);

    pickupDateTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    const cutoff =
      new Date(
        pickupDateTime.getTime() -
        farmer.orderCutoffHours *
        60 *
        60 *
        1000
      );

    if (new Date() >= cutoff) {
      return res.status(400).json({
        success: false,
        message:
          "Cancellation cutoff time has passed",
      });
    }

    // Return stock
    for (const item of order.items) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) continue;

      product.quantityAvailable +=
        item.quantity;

      if (
        product.status === "sold_out" &&
        product.quantityAvailable > 0
      ) {
        product.status = "available";
      }

      await product.save();
    }

    order.status = "cancelled";

    order.cancelledBy =
      "customer";

    order.cancellationReason =
      reason;

    await order.save();

    return res.status(200).json({
      success: true,

      message:
        "Order cancelled successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Cancel order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// FARMER - GET ORDERS
// ======================================================

export const getFarmerOrders = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.query;

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

    const filter: any = {
      farmer: farmer._id,
    };

    if (status) {
      filter.status = status;
    }

    const orders =
      await Order.find(filter)
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "market",
          "name address operatingDays openingTime closingTime latitude longitude"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error(
      "Farmer orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// FARMER - UPDATE ORDER STATUS
// ======================================================

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { status } = req.body;

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

    const order =
      await Order.findOne({
        _id: req.params.id,
        farmer: farmer._id,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const transitions: Record<
      string,
      string[]
    > = {
      placed: [
        "accepted",
        "declined",
      ],

      accepted: [
        "ready",
      ],

      ready: [
        "completed",
      ],
    };

    const allowed =
      transitions[order.status] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,

        message: `Cannot change order from ${order.status} to ${status}`,
      });
    }

    // ----------------------------------------
    // DECLINED -> RETURN STOCK
    // ----------------------------------------

    if (status === "declined") {
      for (const item of order.items) {
        const product =
          await Product.findById(
            item.product
          );

        if (!product) continue;

        product.quantityAvailable +=
          item.quantity;

        if (
          product.status ===
          "sold_out" &&
          product.quantityAvailable > 0
        ) {
          product.status =
            "available";
        }

        await product.save();
      }

      order.cancelledBy =
        "farmer";
    }

    order.status = status;

    await order.save();

    await createOrderStatusNotification({
      customerId:
        order.customer.toString(),

      orderId:
        order._id.toString(),

      status:
        order.status,
    });

    const statusMessages: Record<
      string,
      {
        title: string;
        message: string;
      }
    > = {
      accepted: {
        title: "Order Accepted",
        message:
          "Your preorder has been accepted by the farmer.",
      },

      declined: {
        title: "Order Declined",
        message:
          "Your preorder was declined by the farmer.",
      },

      ready: {
        title: "Order Ready",
        message:
          "Your preorder is ready for pickup.",
      },

      completed: {
        title: "Order Completed",
        message:
          "Your preorder has been marked as completed.",
      },
    };

    const notificationData =
      statusMessages[status];

    if (notificationData) {
      await Notification.create({
        user: order.customer,

        title:
          notificationData.title,

        message:
          notificationData.message,

        type: "order",

        relatedOrder:
          order._id,
      });
    }

    return res.status(200).json({
      success: true,

      message: `Order marked as ${status}`,

      order,
    });
  } catch (error) {
    console.error(
      "Update order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// REORDER DATA - CUSTOMER
// ======================================================

export const reorder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const oldOrder =
      await Order.findOne({
        _id: req.params.id,

        customer:
          req.user!.userId,

        status: "completed",
      });

    if (!oldOrder) {
      return res.status(404).json({
        success: false,
        message:
          "Completed order not found",
      });
    }

    const availableItems: any[] =
      [];

    const unavailableItems: any[] =
      [];

    for (
      const oldItem of
      oldOrder.items
    ) {
      const product =
        await Product.findOne({
          _id:
            oldItem.product,

          farmer:
            oldOrder.farmer,

          isActive: true,

          status:
            "available",
        });

      if (
        !product ||
        product.quantityAvailable <= 0
      ) {
        unavailableItems.push({
          productId:
            oldItem.product,

          name:
            oldItem.name,

          reason:
            "Currently unavailable",
        });

        continue;
      }

      const quantity =
        Math.min(
          oldItem.quantity,
          product.quantityAvailable
        );

      availableItems.push({
        productId:
          product._id,

        name:
          product.name,

        image:
          product.image,

        price:
          product.price,

        unit:
          product.unit,

        quantity,

        availableStock:
          product.quantityAvailable,
      });
    }

    return res.status(200).json({
      success: true,

      reorder: {
        farmer:
          oldOrder.farmer,

        previousmarket:
          oldOrder.market,

        items:
          availableItems,

        unavailableItems,
      },
    });
  } catch (error) {
    console.error(
      "Reorder error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// MODIFY ORDER - CUSTOMER
// ======================================================

export const modifyOrder = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { items } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order items are required",
      });
    }

    const order =
      await Order.findOne({
        _id: req.params.id,

        customer:
          req.user!.userId,
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    if (order.status !== "placed") {
      return res.status(400).json({
        success: false,
        message:
          "Only placed orders can be modified",
      });
    }

    const farmer =
      await FarmerProfile.findById(
        order.farmer
      );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message:
          "Farmer not found",
      });
    }

    // --------------------------------------------
    // CUTOFF
    // --------------------------------------------

    const [hours, minutes] =
      order.pickupSlot.startTime
        .split(":")
        .map(Number);

    const pickupDateTime =
      new Date(order.pickupDate);

    pickupDateTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    const cutoff =
      new Date(
        pickupDateTime.getTime() -
        farmer.orderCutoffHours *
        60 *
        60 *
        1000
      );

    if (new Date() >= cutoff) {
      return res.status(400).json({
        success: false,
        message:
          "Order modification cutoff has passed",
      });
    }

    // --------------------------------------------
    // RETURN CURRENT ORDER STOCK FIRST
    // --------------------------------------------

    for (const oldItem of order.items) {
      await Product.findByIdAndUpdate(
        oldItem.product,

        {
          $inc: {
            quantityAvailable:
              oldItem.quantity,
          },
        }
      );
    }

    // --------------------------------------------
    // VALIDATE NEW ITEMS
    // --------------------------------------------

    const newItems: any[] = [];

    let totalAmount = 0;

    try {
      for (const item of items) {
        if (
          !item.productId ||
          !mongoose.Types.ObjectId.isValid(
            item.productId
          ) ||
          Number(item.quantity) <= 0
        ) {
          throw new Error(
            "INVALID_ITEM"
          );
        }

        const product =
          await Product.findOne({
            _id:
              item.productId,

            farmer:
              farmer._id,

            isActive: true,

            status: {
              $ne:
                "unavailable",
            },
          });

        if (!product) {
          throw new Error(
            "PRODUCT_UNAVAILABLE"
          );
        }

        const quantity =
          Number(
            item.quantity
          );

        if (
          product.quantityAvailable <
          quantity
        ) {
          throw new Error(
            `STOCK:${product.name}`
          );
        }

        const subtotal =
          product.price *
          quantity;

        newItems.push({
          product:
            product._id,

          name:
            product.name,

          price:
            product.price,

          unit:
            product.unit,

          quantity,

          subtotal,
        });

        totalAmount +=
          subtotal;
      }
    } catch (validationError: any) {

      /*
       Validation failed after old stock was restored.
       Re-reserve the original order stock.
      */

      for (
        const oldItem of
        order.items
      ) {
        await Product.findByIdAndUpdate(
          oldItem.product,

          {
            $inc: {
              quantityAvailable:
                -oldItem.quantity,
            },
          }
        );
      }

      if (
        validationError.message.startsWith(
          "STOCK:"
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Not enough stock for ${validationError.message.split(
              ":"
            )[1]
            }`,
        });
      }

      return res.status(400).json({
        success: false,

        message:
          "One or more products are invalid or unavailable",
      });
    }

    // --------------------------------------------
    // RESERVE NEW STOCK
    // --------------------------------------------

    for (const item of newItems) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) continue;

      product.quantityAvailable -=
        item.quantity;

      if (
        product.quantityAvailable <= 0
      ) {
        product.quantityAvailable = 0;

        product.status =
          "sold_out";
      } else if (
        product.status ===
        "sold_out"
      ) {
        product.status =
          "available";
      }

      await product.save();
    }

    // --------------------------------------------
    // FIX PRODUCTS WHOSE STOCK WAS RETURNED
    // --------------------------------------------

    for (const oldItem of order.items) {
      const product =
        await Product.findById(
          oldItem.product
        );

      if (
        product &&
        product.quantityAvailable > 0 &&
        product.status ===
        "sold_out"
      ) {
        product.status =
          "available";

        await product.save();
      }
    }

    order.items =
      newItems as any;

    order.totalAmount =
      totalAmount;

    await order.save();

    return res.status(200).json({
      success: true,

      message:
        "Order modified successfully",

      order,
    });
  } catch (error) {
    console.error(
      "Modify order error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};