import { Request, Response } from "express";

import { Market } from "../models/market.model.js";


// ======================================================
// CREATE MARKET - ADMIN
// ======================================================

export const createMarket = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      address,
      operatingDays,
      openingTime,
      closingTime,
      latitude,
      longitude,
    } = req.body;

    if (
      !name ||
      !address ||
      !operatingDays ||
      !openingTime ||
      !closingTime ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All market fields are required",
      });
    }

    if (
      !Array.isArray(operatingDays) ||
      operatingDays.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one operating day is required",
      });
    }

    const market = await Market.create({
      name,
      address,
      operatingDays,
      openingTime,
      closingTime,
      latitude,
      longitude,
    });
    

    return res.status(201).json({
      success: true,
      message: "Market created successfully",
      market,
    });
  } catch (error) {
    console.error("Create market error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET ALL MARKETS
// ======================================================

export const getMarkets = async (
  req: Request,
  res: Response
) => {
  try {
    const markets = await Market.find({
      isActive: true,
    }).sort({
      name: 1,
    });

    

    return res.status(200).json({
      success: true,
      count: markets.length,
      markets,
    });
  } catch (error) {
    console.error("Get markets error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET SINGLE MARKET
// ======================================================

export const getMarketById = async (
  req: Request,
  res: Response
) => {
  try {
    const market = await Market.findById(
      req.params.id
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    return res.status(200).json({
      success: true,
      market,
    });
  } catch (error) {
    console.error("Get market error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE MARKET - ADMIN
// ======================================================

export const updateMarket = async (
  req: Request,
  res: Response
) => {
  try {
    const market = await Market.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Market updated successfully",
      market,
    });
  } catch (error) {
    console.error("Update market error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// DELETE MARKET - ADMIN
// ======================================================

export const deleteMarket = async (
  req: Request,
  res: Response
) => {
  try {
    const market = await Market.findById(
      req.params.id
    );

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    // Soft delete
    market.isActive = false;

    await market.save();

    return res.status(200).json({
      success: true,
      message: "Market removed successfully",
    });
  } catch (error) {
    console.error("Delete market error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};