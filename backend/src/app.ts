import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import {errorHandler} from "./middlewares/error.middleware.js";
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import marketRoutes from './routes/market.route.js'
import farmerRoutes from './routes/farmer.routes.js'
import categoryRoutes from './routes/category.routes.js'
import productRoutes from './routes/product.route.js'
import marketplaceRoutes from "./routes/marketplace.route.js";
import orderRoutes from "./routes/order.route.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import reviewRoutes from "./routes/review.route.js";
import notificationRoutes from "./routes/notification.routes.js";


const app = express();

// app.use(errorHandler);

app.use(helmet());

app.use(
    cors({
        origin: "*",
        credentials:true,
    })
);

// app.use(
//     rateLimit({
//         windowMs: 15*60*1000,
//         limit:100,
//         standardHeaders: "draft-8",
//         legacyHeaders:false,
//     })
// );

app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({extended:true, limit:"10kb"}));

app.use(cookieParser());

app.get("/api/health", (_req,res) => {
    res.status(200).json({
        success:true,
        message: "Auth API is running",
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/markets", marketRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/marketplace",marketplaceRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/favorites",favoriteRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/notifications",notificationRoutes);

app.use(errorHandler);

export default app;