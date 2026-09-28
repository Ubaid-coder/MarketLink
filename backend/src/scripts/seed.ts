import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import { User } from "../models/user.model.js";
import { FarmerProfile } from "../models/farmer.model.js";
import { Market } from "../models/market.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI;

if (!MONGO_URI) {
  throw new Error("MongoDB URI not found in .env");
}

/* =========================================================
   IMAGE URLS

   Reuse known working URLs instead of filling the DB with
   guessed CDN image IDs.

   You can replace individual images later without changing
   the seed relationships.
========================================================= */

const IMAGES = {
  tomato:
    "https://cdn.pixabay.com/photo/2022/09/05/09/50/tomatoes-7433786_1280.jpg",

  potato:
    "https://cdn.pixabay.com/photo/2016/08/11/08/04/potatoes-1585075_1280.jpg",

  carrot:
    "https://cdn.pixabay.com/photo/2016/08/26/21/16/carrots-1623157_1280.jpg",

  apple:
    "https://cdn.pixabay.com/photo/2016/11/30/15/00/apple-1873078_1280.jpg",

  banana:
    "https://cdn.pixabay.com/photo/2018/09/24/12/20/banana-3699630_1280.jpg",

  cucumber:
    "https://cdn.pixabay.com/photo/2015/07/17/13/44/cucumbers-849269_1280.jpg",

  mint:
    "https://cdn.pixabay.com/photo/2018/05/19/15/23/mint-3414467_1280.jpg",

  orange:
    "https://cdn.pixabay.com/photo/2017/01/20/15/06/oranges-1995056_1280.jpg",

  pepper:
    "https://cdn.pixabay.com/photo/2014/08/18/23/11/bell-peppers-421087_1280.jpg",

  vegetables:
    "https://cdn.pixabay.com/photo/2016/03/05/19/02/vegetables-1238252_1280.jpg",
};

/* =========================================================
   DATE HELPERS
========================================================= */

const daysAgo = (days: number) => {
  const date = new Date();

  date.setDate(date.getDate() - days);

  date.setHours(12, 0, 0, 0);

  return date;
};

const daysFromNow = (days: number) => {
  const date = new Date();

  date.setDate(date.getDate() + days);

  date.setHours(12, 0, 0, 0);

  return date;
};

/* =========================================================
   MAIN SEED
========================================================= */

async function seed() {
  try {
    console.log("\n🌱 MARKETLINK DATABASE SEED");
    console.log("===========================\n");

    await connectDB();

    console.log("✅ MongoDB connected");

    /* =====================================================
       RESET DATABASE

       Dependency order:
       Orders -> Products -> Farmers -> Categories/Markets
       -> Users
    ===================================================== */

    console.log("\n🧹 Removing previous sample data...");

    await Order.deleteMany({});
    await Product.deleteMany({});
    await FarmerProfile.deleteMany({});
    await Category.deleteMany({});
    await Market.deleteMany({});
    await User.deleteMany({});

    console.log("✅ Previous data removed");

    /* =====================================================
       PASSWORD
    ===================================================== */

    const password = await bcrypt.hash(
      "Test1234",
      10
    );

    /* =====================================================
       ADMIN
    ===================================================== */

    const admin = await User.create({
      name: "MarketLink Admin",

      email:
        "admin@marketlink.com",

      password,

      phone:
        "03000000000",

      address:
        "Karachi, Pakistan",

      role: "admin",

      isActive: true,

      favoriteProducts: [],

      favoriteFarmers: [],
    });

    console.log("👑 Admin created");

    /* =====================================================
       CUSTOMERS
    ===================================================== */

    const customers =
      await User.insertMany([
        {
          name: "Ahmed Khan",

          email:
            "ahmed@marketlink.com",

          password,

          phone:
            "03001234567",

          address:
            "Block H, North Nazimabad, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Sara Ali",

          email:
            "sara@marketlink.com",

          password,

          phone:
            "03111234567",

          address:
            "Gulshan-e-Iqbal, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Hamza Ahmed",

          email:
            "hamza@marketlink.com",

          password,

          phone:
            "03221234567",

          address:
            "Federal B Area, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Ayesha Malik",

          email:
            "ayesha@marketlink.com",

          password,

          phone:
            "03331234567",

          address:
            "Clifton Block 5, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Hira Shah",

          email:
            "hira@marketlink.com",

          password,

          phone:
            "03441234567",

          address:
            "PECHS, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Zain Raza",

          email:
            "zain@marketlink.com",

          password,

          phone:
            "03019876543",

          address:
            "Gulistan-e-Johar, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Fatima Noor",

          email:
            "fatima@marketlink.com",

          password,

          phone:
            "03129876543",

          address:
            "North Karachi, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Usman Tariq",

          email:
            "usman.customer@marketlink.com",

          password,

          phone:
            "03239876543",

          address:
            "Malir, Karachi",

          role: "customer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },
      ]);

    console.log(
      `👥 ${customers.length} customers created`
    );

    /* =====================================================
       FARMER USERS
    ===================================================== */

    const farmerUsers =
      await User.insertMany([
        {
          name: "Ali Raza",

          email:
            "ali@marketlink.com",

          password,

          phone:
            "03001111111",

          address:
            "Malir, Karachi",

          role: "farmer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Usman Siddiqui",

          email:
            "usman.farmer@marketlink.com",

          password,

          phone:
            "03112222222",

          address:
            "Gadap Town, Karachi",

          role: "farmer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Imran Sheikh",

          email:
            "imran@marketlink.com",

          password,

          phone:
            "03223333333",

          address:
            "Super Highway, Karachi",

          role: "farmer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Hassan Qureshi",

          email:
            "hassan@marketlink.com",

          password,

          phone:
            "03334444444",

          address:
            "Scheme 33, Karachi",

          role: "farmer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Kamran Ahmed",

          email:
            "kamran@marketlink.com",

          password,

          phone:
            "03445555555",

          address:
            "Korangi, Karachi",

          role: "farmer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },

        {
          name: "Bilal Hussain",

          email:
            "bilal@marketlink.com",

          password,

          phone:
            "03006666666",

          address:
            "Landhi, Karachi",

          role: "farmer",

          isActive: true,

          favoriteProducts: [],

          favoriteFarmers: [],
        },
      ]);

    console.log(
      `🚜 ${farmerUsers.length} farmer users created`
    );

    /* =====================================================
       MARKETS

       These coordinates are demo pickup locations around
       Karachi rather than claims that these are official
       farmers-market organizations.
    ===================================================== */

    const markets =
      await Market.insertMany([
        {
          name:
            "North Nazimabad Green Market",

          address:
            "Block H, North Nazimabad, Karachi",

          operatingDays: [
            "Saturday",
            "Sunday",
          ],

          openingTime:
            "08:00",

          closingTime:
            "18:00",

          latitude:
            24.93499,

          longitude:
            67.04897,

          isActive: true,
        },

        {
          name:
            "Gulshan Fresh Market",

          address:
            "Block 13, Gulshan-e-Iqbal, Karachi",

          operatingDays: [
            "Friday",
            "Saturday",
            "Sunday",
          ],

          openingTime:
            "08:00",

          closingTime:
            "19:00",

          latitude:
            24.90683,

          longitude:
            67.07384,

          isActive: true,
        },

        {
          name:
            "Johar Community Market",

          address:
            "Block 18, Gulistan-e-Johar, Karachi",

          operatingDays: [
            "Friday",
            "Saturday",
          ],

          openingTime:
            "09:00",

          closingTime:
            "18:00",

          latitude:
            24.90871,

          longitude:
            67.12413,

          isActive: true,
        },

        {
          name:
            "Malir Farm Market",

          address:
            "Jinnah Avenue, Malir, Karachi",

          operatingDays: [
            "Saturday",
            "Sunday",
          ],

          openingTime:
            "07:30",

          closingTime:
            "17:00",

          latitude:
            24.9057,

          longitude:
            67.18405,

          isActive: true,
        },
      ]);

    console.log(
      `📍 ${markets.length} markets created`
    );

    /* =====================================================
       FARMER PROFILES
    ===================================================== */

    const farmerDefinitions = [
      {
        user:
          farmerUsers[0]._id,

        stallName:
          "Ali Organic Farm",

        contactPerson:
          "Ali Raza",

        description:
          "Fresh seasonal vegetables grown locally and brought directly to market.",

        approvalStatus:
          "approved",

        orderCutoffHours: 4,

        market:
          markets[0],

        operatingDays: [
          "Saturday",
          "Sunday",
        ],

        stall:
          "Green Zone - Stall A12",
      },

      {
        user:
          farmerUsers[1]._id,

        stallName:
          "Green Valley Farms",

        contactPerson:
          "Usman Siddiqui",

        description:
          "Family farm specializing in fruits, vegetables and fresh herbs.",

        approvalStatus:
          "approved",

        orderCutoffHours: 6,

        market:
          markets[1],

        operatingDays: [
          "Friday",
          "Saturday",
          "Sunday",
        ],

        stall:
          "Fresh Produce - Stall B08",
      },

      {
        user:
          farmerUsers[2]._id,

        stallName:
          "Karachi Fresh Fields",

        contactPerson:
          "Imran Sheikh",

        description:
          "Locally sourced seasonal produce with weekly market availability.",

        approvalStatus:
          "approved",

        orderCutoffHours: 5,

        market:
          markets[2],

        operatingDays: [
          "Friday",
          "Saturday",
        ],

        stall:
          "Main Hall - Stall C05",
      },

      {
        user:
          farmerUsers[3]._id,

        stallName:
          "Sunrise Harvest",

        contactPerson:
          "Hassan Qureshi",

        description:
          "Fresh fruit, herbs and vegetables harvested for weekend markets.",

        approvalStatus:
          "approved",

        orderCutoffHours: 4,

        market:
          markets[3],

        operatingDays: [
          "Saturday",
          "Sunday",
        ],

        stall:
          "Farmers Row - Stall D03",
      },

      {
        user:
          farmerUsers[4]._id,

        stallName:
          "Nature Basket Farm",

        contactPerson:
          "Kamran Ahmed",

        description:
          "New local farmer awaiting MarketLink approval.",

        approvalStatus:
          "pending",

        orderCutoffHours: 4,

        market:
          markets[1],

        operatingDays: [
          "Saturday",
        ],

        stall:
          "Stall P02",
      },

      {
        user:
          farmerUsers[5]._id,

        stallName:
          "Fresh Harvest Farm",

        contactPerson:
          "Bilal Hussain",

        description:
          "Seasonal produce supplier currently suspended from marketplace listings.",

        approvalStatus:
          "suspended",

        orderCutoffHours: 4,

        market:
          markets[0],

        operatingDays: [
          "Sunday",
        ],

        stall:
          "Stall S09",
      },
    ];

    const farmerProfiles: any[] = [];

    for (
      const farmer of
      farmerDefinitions
    ) {
      const profile =
        await FarmerProfile.create({
          user:
            farmer.user,

          stallName:
            farmer.stallName,

          contactPerson:
            farmer.contactPerson,

          description:
            farmer.description,

          approvalStatus:
            farmer.approvalStatus,

          orderCutoffHours:
            farmer.orderCutoffHours,

          marketSchedules: [
            {
              market:
                farmer.market._id,

              operatingDays:
                farmer.operatingDays,

              pickupWindows: [
                {
                  startTime:
                    "09:00",

                  endTime:
                    "11:00",
                },

                {
                  startTime:
                    "11:30",

                  endTime:
                    "13:30",
                },

                {
                  startTime:
                    "14:00",

                  endTime:
                    "16:00",
                },
              ],

              stallLocation: {
                description:
                  farmer.stall,

                latitude:
                  farmer.market
                    .latitude,

                longitude:
                  farmer.market
                    .longitude,
              },
            },
          ],
        });

      farmerProfiles.push(
        profile
      );
    }

    const [
      aliFarm,
      greenValley,
      karachiFields,
      sunriseHarvest,
      pendingFarm,
      suspendedFarm,
    ] = farmerProfiles;

    console.log(
      "👨‍🌾 6 farmer profiles created"
    );

    console.log(
      "   ✅ 4 approved"
    );

    console.log(
      "   ⏳ 1 pending"
    );

    console.log(
      "   ⛔ 1 suspended"
    );

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories =
      await Category.insertMany([
        {
          name:
            "Vegetables",

          description:
            "Fresh locally grown vegetables",

          isActive: true,
        },

        {
          name:
            "Fruits",

          description:
            "Fresh seasonal fruits",

          isActive: true,
        },

        {
          name:
            "Leafy Greens",

          description:
            "Fresh leafy vegetables and greens",

          isActive: true,
        },

        {
          name:
            "Herbs",

          description:
            "Fresh culinary herbs",

          isActive: true,
        },

        {
          name:
            "Organic Produce",

          description:
            "Naturally grown farm produce",

          isActive: true,
        },

        {
          name:
            "Seasonal Produce",

          description:
            "Products available during specific seasons",

          isActive: true,
        },
      ]);

    const [
      vegetables,
      fruits,
      leafy,
      herbs,
      organic,
      seasonal,
    ] = categories;

    console.log(
      `🥬 ${categories.length} categories created`
    );

    /* =====================================================
       PRODUCT HELPER
    ===================================================== */

    const makeProduct = (
      farmer: any,
      category: any,
      name: string,
      description: string,
      price: number,
      unit: string,
      quantity: number,
      image: string,
      status:
        | "available"
        | "sold_out"
        | "unavailable" =
        "available",
      isActive = true
    ) => ({
      farmer:
        farmer._id,

      category:
        category._id,

      name,

      description,

      price,

      unit,

      quantityAvailable:
        quantity,

      image,

      status,

      weeklyStockTemplate: {
        enabled: true,

        defaultQuantity:
          Math.max(
            quantity,
            20
          ),
      },

      isActive,
    });

    /* =====================================================
       PRODUCTS
    ===================================================== */

    const products =
      await Product.insertMany([
        // ALI ORGANIC FARM

        makeProduct(
          aliFarm,
          vegetables,
          "Fresh Tomatoes",
          "Fresh red tomatoes harvested locally.",
          180,
          "kg",
          42,
          IMAGES.tomato
        ),

        makeProduct(
          aliFarm,
          vegetables,
          "Farm Potatoes",
          "Fresh potatoes for everyday cooking.",
          140,
          "kg",
          55,
          IMAGES.potato
        ),

        makeProduct(
          aliFarm,
          vegetables,
          "Fresh Carrots",
          "Crunchy locally grown carrots.",
          170,
          "kg",
          34,
          IMAGES.carrot
        ),

        makeProduct(
          aliFarm,
          leafy,
          "Fresh Spinach",
          "Fresh leafy spinach harvested for the weekend market.",
          90,
          "bunch",
          25,
          IMAGES.vegetables
        ),

        makeProduct(
          aliFarm,
          herbs,
          "Fresh Mint",
          "Fragrant fresh mint leaves.",
          60,
          "bunch",
          20,
          IMAGES.mint
        ),

        makeProduct(
          aliFarm,
          organic,
          "Organic Tomatoes",
          "Naturally grown premium tomatoes.",
          230,
          "kg",
          18,
          IMAGES.tomato
        ),

        // GREEN VALLEY

        makeProduct(
          greenValley,
          fruits,
          "Fresh Apples",
          "Crisp fresh apples selected for market day.",
          350,
          "kg",
          40,
          IMAGES.apple
        ),

        makeProduct(
          greenValley,
          fruits,
          "Fresh Bananas",
          "Naturally ripened bananas.",
          220,
          "dozen",
          36,
          IMAGES.banana
        ),

        makeProduct(
          greenValley,
          vegetables,
          "Green Cucumbers",
          "Crisp cucumbers ideal for salads.",
          150,
          "kg",
          30,
          IMAGES.cucumber
        ),

        makeProduct(
          greenValley,
          vegetables,
          "Bell Peppers",
          "Fresh colorful bell peppers.",
          320,
          "kg",
          22,
          IMAGES.pepper
        ),

        makeProduct(
          greenValley,
          herbs,
          "Mint Leaves",
          "Fresh aromatic mint.",
          55,
          "bunch",
          30,
          IMAGES.mint
        ),

        makeProduct(
          greenValley,
          seasonal,
          "Seasonal Oranges",
          "Sweet seasonal oranges.",
          280,
          "kg",
          0,
          IMAGES.orange,
          "sold_out"
        ),

        // KARACHI FRESH FIELDS

        makeProduct(
          karachiFields,
          vegetables,
          "Red Tomatoes",
          "Fresh field-grown tomatoes.",
          175,
          "kg",
          50,
          IMAGES.tomato
        ),

        makeProduct(
          karachiFields,
          vegetables,
          "Premium Potatoes",
          "Cleaned premium farm potatoes.",
          155,
          "kg",
          60,
          IMAGES.potato
        ),

        makeProduct(
          karachiFields,
          vegetables,
          "Carrots",
          "Fresh crunchy carrots.",
          165,
          "kg",
          28,
          IMAGES.carrot
        ),

        makeProduct(
          karachiFields,
          leafy,
          "Farm Greens",
          "Mixed fresh leafy greens.",
          120,
          "bunch",
          32,
          IMAGES.vegetables
        ),

        makeProduct(
          karachiFields,
          organic,
          "Organic Vegetable Box",
          "Mixed selection of locally grown vegetables.",
          650,
          "box",
          15,
          IMAGES.vegetables
        ),

        makeProduct(
          karachiFields,
          vegetables,
          "Cucumbers",
          "Fresh green cucumbers.",
          145,
          "kg",
          0,
          IMAGES.cucumber,
          "unavailable"
        ),

        // SUNRISE HARVEST

        makeProduct(
          sunriseHarvest,
          fruits,
          "Red Apples",
          "Fresh crisp red apples.",
          370,
          "kg",
          28,
          IMAGES.apple
        ),

        makeProduct(
          sunriseHarvest,
          fruits,
          "Bananas",
          "Fresh market bananas.",
          210,
          "dozen",
          40,
          IMAGES.banana
        ),

        makeProduct(
          sunriseHarvest,
          fruits,
          "Fresh Oranges",
          "Juicy seasonal oranges.",
          290,
          "kg",
          35,
          IMAGES.orange
        ),

        makeProduct(
          sunriseHarvest,
          vegetables,
          "Mixed Bell Peppers",
          "Colorful fresh bell peppers.",
          340,
          "kg",
          20,
          IMAGES.pepper
        ),

        makeProduct(
          sunriseHarvest,
          herbs,
          "Fresh Mint Bunch",
          "Fresh mint picked for market day.",
          50,
          "bunch",
          24,
          IMAGES.mint
        ),

        makeProduct(
          sunriseHarvest,
          organic,
          "Organic Vegetable Basket",
          "Selection of seasonal organic vegetables.",
          750,
          "basket",
          12,
          IMAGES.vegetables
        ),

        // PENDING FARMER DATA

        makeProduct(
          pendingFarm,
          vegetables,
          "Farm Tomatoes",
          "Product belonging to a pending farmer.",
          190,
          "kg",
          20,
          IMAGES.tomato
        ),

        makeProduct(
          pendingFarm,
          fruits,
          "Farm Apples",
          "Product belonging to a pending farmer.",
          360,
          "kg",
          20,
          IMAGES.apple
        ),

        // SUSPENDED FARMER DATA

        makeProduct(
          suspendedFarm,
          vegetables,
          "Suspended Farm Potatoes",
          "Product retained for admin moderation demonstration.",
          145,
          "kg",
          25,
          IMAGES.potato
        ),

        makeProduct(
          suspendedFarm,
          vegetables,
          "Suspended Farm Peppers",
          "Product retained for admin moderation demonstration.",
          300,
          "kg",
          18,
          IMAGES.pepper
        ),
      ]);

    console.log(
      `📦 ${products.length} products created`
    );

    /* =====================================================
       PRODUCT REFERENCES
    ===================================================== */

    const [
      tomatoes,
      potatoes,
      carrots,
      spinach,
      mint,
      organicTomatoes,

      apples,
      bananas,
      cucumbers,
      peppers,
      mintLeaves,
      oranges,

      redTomatoes,
      premiumPotatoes,
      fieldCarrots,
      farmGreens,
      vegetableBox,

      unavailableCucumber,

      redApples,
      sunriseBananas,
      freshOranges,
      mixedPeppers,
      freshMint,
      organicBasket,
    ] = products;

    /* =====================================================
       ORDER HELPER
    ===================================================== */

    const orderItem = (
      product: any,
      quantity: number
    ) => ({
      product:
        product._id,

      name:
        product.name,

      price:
        product.price,

      unit:
        product.unit,

      quantity,

      subtotal:
        product.price *
        quantity,
    });

    const createOrder = async ({
      customer,
      farmer,
      market,
      items,
      status,
      pickupDate,
      customerNote,
      cancellationReason,
      cancelledBy,
    }: any) => {
      const totalAmount =
        items.reduce(
          (
            total: number,
            item: any
          ) =>
            total +
            item.subtotal,
          0
        );

      return Order.create({
        customer:
          customer._id,

        farmer:
          farmer._id,

        market:
          market._id,

        items,

        totalAmount,

        pickupDate,

        pickupSlot: {
          startTime:
            "11:30",

          endTime:
            "13:30",
        },

        status,

        customerNote,

        ...(cancellationReason
          ? {
              cancellationReason,
            }
          : {}),

        ...(cancelledBy
          ? {
              cancelledBy,
            }
          : {}),
      });
    };

    /* =====================================================
       ORDERS

       Deliberately distributed among statuses so:
       - customer history looks real
       - farmer dashboard has revenue/history
       - admin reports have useful numbers
    ===================================================== */

    const orders = [];

    // ---------------- COMPLETED ----------------

    orders.push(
      await createOrder({
        customer:
          customers[0],

        farmer:
          aliFarm,

        market:
          markets[0],

        items: [
          orderItem(
            tomatoes,
            2
          ),

          orderItem(
            potatoes,
            1
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(24),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[1],

        farmer:
          greenValley,

        market:
          markets[1],

        items: [
          orderItem(
            apples,
            2
          ),

          orderItem(
            mintLeaves,
            2
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(20),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[2],

        farmer:
          aliFarm,

        market:
          markets[0],

        items: [
          orderItem(
            carrots,
            3
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(18),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[3],

        farmer:
          karachiFields,

        market:
          markets[2],

        items: [
          orderItem(
            vegetableBox,
            1
          ),

          orderItem(
            redTomatoes,
            2
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(15),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[4],

        farmer:
          sunriseHarvest,

        market:
          markets[3],

        items: [
          orderItem(
            freshOranges,
            2
          ),

          orderItem(
            freshMint,
            1
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(12),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[5],

        farmer:
          greenValley,

        market:
          markets[1],

        items: [
          orderItem(
            bananas,
            2
          ),

          orderItem(
            cucumbers,
            2
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(10),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[6],

        farmer:
          karachiFields,

        market:
          markets[2],

        items: [
          orderItem(
            premiumPotatoes,
            3
          ),

          orderItem(
            farmGreens,
            2
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(8),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[7],

        farmer:
          sunriseHarvest,

        market:
          markets[3],

        items: [
          orderItem(
            redApples,
            2
          ),

          orderItem(
            sunriseBananas,
            1
          ),
        ],

        status:
          "completed",

        pickupDate:
          daysAgo(6),
      })
    );

    // ---------------- PLACED ----------------

    orders.push(
      await createOrder({
        customer:
          customers[0],

        farmer:
          greenValley,

        market:
          markets[1],

        items: [
          orderItem(
            apples,
            1
          ),

          orderItem(
            peppers,
            1
          ),
        ],

        status:
          "placed",

        pickupDate:
          daysFromNow(3),

        customerNote:
          "Please keep the freshest produce available.",
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[3],

        farmer:
          aliFarm,

        market:
          markets[0],

        items: [
          orderItem(
            organicTomatoes,
            2
          ),
        ],

        status:
          "placed",

        pickupDate:
          daysFromNow(4),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[6],

        farmer:
          sunriseHarvest,

        market:
          markets[3],

        items: [
          orderItem(
            organicBasket,
            1
          ),
        ],

        status:
          "placed",

        pickupDate:
          daysFromNow(5),
      })
    );

    // ---------------- ACCEPTED ----------------

    orders.push(
      await createOrder({
        customer:
          customers[1],

        farmer:
          aliFarm,

        market:
          markets[0],

        items: [
          orderItem(
            tomatoes,
            2
          ),

          orderItem(
            spinach,
            2
          ),
        ],

        status:
          "accepted",

        pickupDate:
          daysFromNow(2),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[4],

        farmer:
          karachiFields,

        market:
          markets[2],

        items: [
          orderItem(
            fieldCarrots,
            2
          ),

          orderItem(
            premiumPotatoes,
            2
          ),
        ],

        status:
          "accepted",

        pickupDate:
          daysFromNow(2),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[7],

        farmer:
          greenValley,

        market:
          markets[1],

        items: [
          orderItem(
            bananas,
            1
          ),

          orderItem(
            cucumbers,
            2
          ),
        ],

        status:
          "accepted",

        pickupDate:
          daysFromNow(3),
      })
    );

    // ---------------- READY ----------------

    orders.push(
      await createOrder({
        customer:
          customers[2],

        farmer:
          greenValley,

        market:
          markets[1],

        items: [
          orderItem(
            apples,
            1
          ),

          orderItem(
            mintLeaves,
            1
          ),
        ],

        status:
          "ready",

        pickupDate:
          daysFromNow(1),
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[5],

        farmer:
          sunriseHarvest,

        market:
          markets[3],

        items: [
          orderItem(
            freshOranges,
            2
          ),

          orderItem(
            mixedPeppers,
            1
          ),
        ],

        status:
          "ready",

        pickupDate:
          daysFromNow(1),
      })
    );

    // ---------------- CANCELLED ----------------

    orders.push(
      await createOrder({
        customer:
          customers[0],

        farmer:
          karachiFields,

        market:
          markets[2],

        items: [
          orderItem(
            redTomatoes,
            2
          ),
        ],

        status:
          "cancelled",

        pickupDate:
          daysAgo(4),

        cancellationReason:
          "Customer plans changed.",

        cancelledBy:
          "customer",
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[6],

        farmer:
          aliFarm,

        market:
          markets[0],

        items: [
          orderItem(
            potatoes,
            2
          ),
        ],

        status:
          "cancelled",

        pickupDate:
          daysAgo(3),

        cancellationReason:
          "Customer requested cancellation.",

        cancelledBy:
          "customer",
      })
    );

    // ---------------- DECLINED ----------------

    orders.push(
      await createOrder({
        customer:
          customers[3],

        farmer:
          greenValley,

        market:
          markets[1],

        items: [
          orderItem(
            peppers,
            4
          ),
        ],

        status:
          "declined",

        pickupDate:
          daysAgo(5),

        cancellationReason:
          "Requested quantity could not be fulfilled.",

        cancelledBy:
          "farmer",
      })
    );

    orders.push(
      await createOrder({
        customer:
          customers[4],

        farmer:
          sunriseHarvest,

        market:
          markets[3],

        items: [
          orderItem(
            redApples,
            5
          ),
        ],

        status:
          "declined",

        pickupDate:
          daysAgo(2),

        cancellationReason:
          "Insufficient stock for requested quantity.",

        cancelledBy:
          "farmer",
      })
    );

    console.log(
      `🧾 ${orders.length} orders created`
    );

    /* =====================================================
       FAVORITES
    ===================================================== */

    await User.findByIdAndUpdate(
      customers[0]._id,
      {
        $set: {
          favoriteProducts: [
            tomatoes._id,
            apples._id,
            vegetableBox._id,
          ],

          favoriteFarmers: [
            aliFarm._id,
            greenValley._id,
          ],
        },
      }
    );

    await User.findByIdAndUpdate(
      customers[1]._id,
      {
        $set: {
          favoriteProducts: [
            bananas._id,
            carrots._id,
            freshOranges._id,
          ],

          favoriteFarmers: [
            greenValley._id,
            sunriseHarvest._id,
          ],
        },
      }
    );

    await User.findByIdAndUpdate(
      customers[2]._id,
      {
        $set: {
          favoriteProducts: [
            organicTomatoes._id,
            redApples._id,
          ],

          favoriteFarmers: [
            aliFarm._id,
          ],
        },
      }
    );

    console.log(
      "❤️ Sample favorites created"
    );

    /* =====================================================
       SUMMARY
    ===================================================== */

    console.log(
      "\n=========================================="
    );

    console.log(
      "🎉 MARKETLINK DATABASE READY"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `\n👑 Admin:       1`
    );

    console.log(
      `👥 Customers:   ${customers.length}`
    );

    console.log(
      `🚜 Farmers:     ${farmerProfiles.length}`
    );

    console.log(
      `📍 Markets:     ${markets.length}`
    );

    console.log(
      `🥬 Categories:  ${categories.length}`
    );

    console.log(
      `📦 Products:    ${products.length}`
    );

    console.log(
      `🧾 Orders:      ${orders.length}`
    );

    console.log(
      "\n------------------------------------------"
    );

    console.log(
      "LOGIN CREDENTIALS"
    );

    console.log(
      "------------------------------------------"
    );

    console.log(
      "\n👑 ADMIN"
    );

    console.log(
      "admin@marketlink.com"
    );

    console.log(
      "Password: Test1234"
    );

    console.log(
      "\n👤 CUSTOMER"
    );

    console.log(
      "ahmed@marketlink.com"
    );

    console.log(
      "Password: Test1234"
    );

    console.log(
      "\n🚜 APPROVED FARMER"
    );

    console.log(
      "ali@marketlink.com"
    );

    console.log(
      "Password: Test1234"
    );

    console.log(
      "\n🚜 SECOND FARMER"
    );

    console.log(
      "usman.farmer@marketlink.com"
    );

    console.log(
      "Password: Test1234"
    );

    console.log(
      "\n⏳ PENDING FARMER"
    );

    console.log(
      "kamran@marketlink.com"
    );

    console.log(
      "Password: Test1234"
    );

    console.log(
      "\n⛔ SUSPENDED FARMER"
    );

    console.log(
      "bilal@marketlink.com"
    );

    console.log(
      "Password: Test1234"
    );

    console.log(
      "\n=========================================="
    );

    console.log(
      "✅ Seed completed successfully."
    );

    console.log(
      "==========================================\n"
    );

    void admin;
    void unavailableCucumber;
  } catch (error) {
    console.error(
      "\n❌ SEED FAILED\n"
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "🔌 MongoDB disconnected."
    );
  }
}

seed();