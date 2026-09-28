import { Request, Response } from "express";
import mongoose from "mongoose";

import { Product } from "../models/product.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { Market } from "../models/market.model.js";


// ======================================================
// GET MARKETPLACE PRODUCTS
// ======================================================

export const getMarketplaceProducts = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      market,
      day,
      sort,
    } = req.query;

    const productFilter: any = {
      isActive: true,
      status: "available",
      quantityAvailable: { $gt: 0 },
    };

    // --------------------------------------------
    // SEARCH
    // --------------------------------------------

    if (search) {
      productFilter.$text = {
        $search: search as string,
      };
    }

    // --------------------------------------------
    // CATEGORY
    // --------------------------------------------

    if (category) {
      if (
        !mongoose.Types.ObjectId.isValid(
          category as string
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      productFilter.category = category;
    }

    // --------------------------------------------
    // PRICE RANGE
    // --------------------------------------------

    if (minPrice || maxPrice) {
      productFilter.price = {};

      if (minPrice) {
        productFilter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice) {
        productFilter.price.$lte =
          Number(maxPrice);
      }
    }

    // --------------------------------------------
    // FARMER FILTER
    //
    // Market/day belongs to FarmerProfile,
    // not Product.
    // --------------------------------------------

    if (market || day) {
      const farmerFilter: any = {
        approvalStatus: "approved",
      };

      if (market) {
        if (
          !mongoose.Types.ObjectId.isValid(
            market as string
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid market ID",
          });
        }

        farmerFilter.marketSchedules = {
          $elemMatch: {
            market: market,
            ...(day
              ? {
                  operatingDays: day,
                }
              : {}),
          },
        };
      } else if (day) {
        farmerFilter[
          "marketSchedules.operatingDays"
        ] = day;
      }

      const farmers = await FarmerProfile.find(
        farmerFilter
      ).select("_id");

      const farmerIds = farmers.map(
        (farmer) => farmer._id
      );

      productFilter.farmer = {
        $in: farmerIds,
      };
    } else {
      /*
        Even without market/day filter, customer should
        only see products belonging to APPROVED farmers.
      */

      const approvedFarmers =
        await FarmerProfile.find({
          approvalStatus: "approved",
        }).select("_id");

      productFilter.farmer = {
        $in: approvedFarmers.map(
          (farmer) => farmer._id
        ),
      };
    }

    // --------------------------------------------
    // SORT
    // --------------------------------------------

    let sortOption: any = {
      createdAt: -1,
    };

    if (sort === "price_asc") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price_desc") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    }

    const products = await Product.find(
      productFilter
    )
      .populate(
        "category",
        "name description"
      )
      .populate({
        path: "farmer",

        select:
          "stallName description image marketSchedules approvalStatus",

        populate: {
          path: "marketSchedules.market",
          select:
            "name address operatingDays openingTime closingTime latitude longitude",
        },
      })
      .sort(sortOption);

    return res.status(200).json({
      success: true,
      count: products.length,

      filters: {
        search: search || null,
        category: category || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        market: market || null,
        day: day || null,
        sort: sort || null,
      },

      products,
    });
  } catch (error) {
    console.error(
      "Marketplace products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET SINGLE MARKETPLACE PRODUCT
// ======================================================

export const getMarketplaceProductById = async (
  req: Request,
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
        message: "Invalid product ID",
      });
    }

   const product = await Product.findOne({
  _id: req.params.id,

  isActive: true,

  status: "available",

  quantityAvailable: {
    $gt: 0,
  },
})
      .populate(
        "category",
        "name description"
      )
      .populate({
        path: "farmer",

        select:
          "stallName description image marketSchedules approvalStatus",

        populate: {
          path: "marketSchedules.market",

          select:
            "name address operatingDays openingTime closingTime latitude longitude",
        },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /*
      Important:
      populated farmer may technically exist but we
      shouldn't expose suspended farmers.
    */

    const farmer: any = product.farmer;

    if (
      !farmer ||
      farmer.approvalStatus !== "approved"
    ) {
      return res.status(404).json({
        success: false,
        message: "Product not available",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Marketplace product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET MARKETPLACE FARMERS
// ======================================================

export const getMarketplaceFarmers = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      search,
      market,
      day,
    } = req.query;

    const filter: any = {
      approvalStatus: "approved",
    };

    // --------------------------------------------
    // FARMER SEARCH
    // --------------------------------------------

    if (search) {
      filter.$or = [
        {
          stallName: {
            $regex: search,
            $options: "i",
          },
        },

        {
          contactPerson: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // --------------------------------------------
    // MARKET + DAY
    // --------------------------------------------

    if (market) {
      if (
        !mongoose.Types.ObjectId.isValid(
          market as string
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid market ID",
        });
      }

      filter.marketSchedules = {
        $elemMatch: {
          market,

          ...(day
            ? {
                operatingDays: day,
              }
            : {}),
        },
      };
    } else if (day) {
      filter[
        "marketSchedules.operatingDays"
      ] = day;
    }

    const farmers = await FarmerProfile.find(
      filter
    )
      .select(
        "stallName contactPerson description image marketSchedules"
      )
      .populate(
        "marketSchedules.market",
        "name address operatingDays openingTime closingTime latitude longitude"
      )
      .sort({
        stallName: 1,
      });

    return res.status(200).json({
      success: true,
      count: farmers.length,
      farmers,
    });
  } catch (error) {
    console.error(
      "Marketplace farmers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET FARMER PUBLIC PROFILE
// ======================================================

export const getMarketplaceFarmerById = async (
  req: Request,
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
        message: "Invalid farmer ID",
      });
    }

    const farmer = await FarmerProfile.findOne({
      _id: req.params.id,
      approvalStatus: "approved",
    })
      .select(
        "stallName contactPerson description image marketSchedules orderCutoffHours"
      )
      .populate(
        "marketSchedules.market",
        "name address operatingDays openingTime closingTime latitude longitude"
      );

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    const products = await Product.find({
      farmer: farmer._id,

      isActive: true,

      status: "available",

      quantityAvailable: {
        $gt: 0,
      },
    })
      .populate(
        "category",
        "name"
      )
      .sort({
        name: 1,
      });

    return res.status(200).json({
      success: true,

      farmer,

      products,
    });
  } catch (error) {
    console.error(
      "Marketplace farmer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET FARMERS AT A PARTICULAR MARKET
// ======================================================

export const getFarmersByMarket = async (
  req: Request,
  res: Response
) => {
  try {
    const { marketId } = req.params;

    const { day } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(
        marketId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid market ID",
      });
    }

    const market = await Market.findOne({
      _id: marketId,
      isActive: true,
    });

    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }

    const scheduleFilter: any = {
      market: marketId,
    };

    if (day) {
      scheduleFilter.operatingDays = day;
    }

    const farmers = await FarmerProfile.find({
      approvalStatus: "approved",

      marketSchedules: {
        $elemMatch: scheduleFilter,
      },
    })
      .select(
        "stallName contactPerson description image marketSchedules"
      )
      .populate(
        "marketSchedules.market",
        "name address operatingDays openingTime closingTime latitude longitude"
      );

    return res.status(200).json({
      success: true,

      market,

      count: farmers.length,

      farmers,
    });
  } catch (error) {
    console.error(
      "Market farmers error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};