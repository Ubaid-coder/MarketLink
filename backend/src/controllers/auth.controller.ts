import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { User } from "../models/user.model.js";
import { Market } from "../models/market.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { generateToken } from "../utils/generateToken.js";


// ======================================================
// CUSTOMER REGISTER
// ======================================================

export const registerCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
      role: "customer",
    });

    const token = generateToken(
      user._id.toString(),
      user.role
    );

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// FARMER REGISTER
// ======================================================

export const registerFarmer = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,

      stallName,
      contactPerson,
      description,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !stallName ||
      !contactPerson
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      address,
      role: "farmer",
    });

    try {
      const farmer = await FarmerProfile.create({
        user: user._id,

        stallName,
        contactPerson,
        description,

        marketSchedules: [],

        approvalStatus: "pending",
      });

      const token = generateToken(
        user._id.toString(),
        user.role
      );

      return res.status(201).json({
        success: true,

        message:
          "Farmer registered successfully. Waiting for admin approval.",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        farmer: {
          id: farmer._id,
          stallName: farmer.stallName,
          approvalStatus: farmer.approvalStatus,
        },
      });
    } catch (farmerError) {
      // Avoid leaving an orphan User if FarmerProfile creation fails
      await User.findByIdAndDelete(user._id);

      throw farmerError;
    }
  } catch (error) {
    console.error("Register farmer error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // password has select:false in User model
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    let farmerProfile = null;

    if (user.role === "farmer") {
      farmerProfile = await FarmerProfile.findOne({
        user: user._id,
      }).select("stallName approvalStatus");
    }

    const token = generateToken(
      user._id.toString(),
      user.role
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        ...(farmerProfile && {
          farmerProfile: {
            id: farmerProfile._id,
            stallName: farmerProfile.stallName,
            approvalStatus:
              farmerProfile.approvalStatus,
          },
        }),
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// CURRENT USER
// ======================================================

export const getMe = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId);
    console.log(user)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let farmerProfile = null;

    if (user.role === "farmer") {
      await Market.find();
      farmerProfile = await FarmerProfile.findOne({
        user: user._id,
      })?.populate("marketSchedules.market");
    }

    return res.status(200).json({
      success: true,
      user,
      farmerProfile,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};