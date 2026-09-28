# MarketLink

**MarketLink** is a full-stack MERN web application that connects local farmers-market farmers with customers. Farmers can publish weekly stock, manage pickup-based pre-orders, and maintain market schedules, while customers can discover products, farmers, and markets and reserve products for pickup.

> **Theme:** eGreen Basket  
> **Category:** End-to-End Web Solution  
> **Version:** 1.0

---

## Overview

Traditional farmers markets often lack a centralized way for customers to know which farmers are attending, what products are currently available, and whether an item will still be in stock when they arrive.

MarketLink addresses this by providing a single platform for:

- Customer product and farmer discovery
- Farmer inventory and weekly stock management
- Market and pickup-location management
- Pickup-based pre-orders
- Order lifecycle tracking
- Favorites and notifications
- Farmer and admin dashboards
- Administrative moderation and analytics

MarketLink does **not** use an online payment gateway. Customers reserve products through the application and pay the farmer in person when collecting their order.

---

## User Roles

### Customer

Customers can:

- Register and log in securely
- Browse available products
- Search/filter marketplace listings
- Browse farmers and markets
- View farmer stalls and pickup information
- Add products to a cart
- Place pickup pre-orders
- Select pickup dates and time windows
- Track order status
- Cancel or modify eligible orders before cutoff
- View order history
- Reorder previous purchases
- Favorite products and farmers
- Receive in-app notifications

### Farmer

Farmers can:

- Register a farmer account
- Maintain a farmer/stall profile
- Configure market schedules
- Configure operating days and pickup windows
- Add, edit, and remove products
- Set prices and available quantities
- Mark products available, sold out, or unavailable
- Configure recurring weekly stock
- Receive customer pre-orders
- Accept or decline orders
- Mark orders ready for pickup
- Complete orders
- View order history and dashboard statistics

Farmer accounts can be **pending**, **approved**, or **suspended**.

### Admin

Administrators can:

- Access a dedicated admin dashboard
- View platform statistics
- Approve or suspend farmers
- Activate/deactivate customers
- Manage markets
- Manage product categories
- Moderate product listings
- View platform-wide reports
- Review order/revenue activity
- View active farmers
- Publish announcements

---

## Order Lifecycle

A typical MarketLink order follows:

```text
Customer adds products
        ↓
Selects market + pickup date + pickup slot
        ↓
Places preorder
        ↓
PLACED
        ↓
Farmer accepts
        ↓
ACCEPTED
        ↓
Farmer prepares order
        ↓
READY
        ↓
Customer collects order and pays in person
        ↓
COMPLETED
```

Orders can also become:

```text
CANCELLED
DECLINED
```

No delivery or online payment is required.

---

## Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcrypt

### Database

MongoDB / MongoDB Atlas

---

## Main Database Entities

MarketLink currently uses the following major entities:

- User
- FarmerProfile
- Market
- Category
- Product
- Order
- Review
- Notification

The shopping cart is maintained on the client side until checkout.

---

## Project Structure

A typical project structure is:

```text
MarketLink/
│
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── .env.local
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   │   └── seed.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── .env
│
└── README.md
```

Your exact folder structure may differ slightly depending on the final repository layout.

---

## Environment Variables

### Backend

Create a `.env` file in the backend/server project.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Use the exact environment-variable names expected by your backend configuration.

### Frontend

Create:

```text
client/.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Never commit real secrets or production credentials to GitHub.

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd MarketLink
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Add the required `.env` and `.env.local` files.

### 5. Seed the database

From the backend/server directory:

```bash
npx tsx src/scripts/seed.ts
```

> **Warning:** the development seed script resets the seeded MarketLink collections before recreating the demo dataset. Do not run it against a database containing data you need to preserve.

### 6. Start the backend

```bash
npm run dev
```

### 7. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Then open the local URL shown by Next.js, normally:

```text
http://localhost:3000
```

---

## Demo Seed Data

The development seed provides a populated environment containing:

- 1 administrator
- 8 customers
- 6 farmer accounts
- Approved farmers
- Pending farmer
- Suspended farmer
- Multiple Karachi demo market locations
- Product categories
- A populated product catalogue
- Available products
- Sold-out products
- Unavailable products
- Customer favorites
- Historical and active orders

Seeded orders cover the major lifecycle states:

```text
placed
accepted
ready
completed
cancelled
declined
```

This makes customer order history, farmer dashboards, and administrator reports useful immediately after seeding.

---

## Demo Accounts

All development/demo accounts use:

```text
Password: Test1234
```

### Admin

```text
Name: MarketLink Admin
Email: admin@marketlink.com
```

### Customer

```text
Name: Ahmed Khan
Email: ahmed@marketlink.com
```

### Approved Farmer

```text
Name: Ali Raza
Email: ali@marketlink.com
Stall: Ali Organic Farm
```

### Pending Farmer

```text
Name: Kamran Ahmed
Email: kamran@marketlink.com
Stall: Nature Basket Farm
```

### Suspended Farmer

```text
Name: Bilal Hussain
Email: bilal@marketlink.com
Stall: Fresh Harvest Farm
```

These credentials are intended for development/demo use only.

---

## Important API Areas

The application contains API functionality for:

```text
/auth
/markets
/farmers
/products
/marketplace
/orders
/favorites
/reviews
/notifications
/admin
```

Access to protected routes is controlled using authentication and role-based authorization.

---

## Security

MarketLink includes application-level security practices such as:

- Password hashing
- JWT authentication
- Protected backend routes
- Role-based access control
- Customer/farmer/admin authorization
- Server-side validation
- Farmer approval controls
- Customer activation/deactivation
- Product moderation

Production deployments should additionally use secure environment-variable management, HTTPS, restrictive CORS configuration, rate limiting, stronger validation, logging, and appropriate database/network controls.

---

## Market & Pickup Locations

Markets contain:

- Market name
- Address
- Operating days
- Opening/closing times
- Latitude
- Longitude

Farmer schedules additionally contain pickup windows and stall-location information.

The development seed uses demo locations around Karachi for testing location and pickup-related functionality.

---

## Product Inventory

Products contain information such as:

- Farmer
- Category
- Product name
- Description
- Price
- Unit
- Available quantity
- Image
- Availability status
- Weekly stock template
- Active/moderation state

Supported availability states include:

```text
available
sold_out
unavailable
```

---

## Admin Reports

The reporting system can provide platform information such as:

- Order status statistics
- Total revenue
- Average order value
- Active farmers
- Completed-order activity

The seeded database intentionally includes multiple completed, cancelled, declined, placed, accepted, and ready orders so these reports are populated during demonstrations.

---

## Design

MarketLink uses the **eGreen Basket** visual direction.

Primary design colors include:

```text
Forest Green:     #166534
Fresh Green:      #22C55E
Light Green:      #DCFCE7
Harvest Orange:   #F59E0B
Warm Off-White:   #FAFAF7
Charcoal:         #1F2937
Gray:             #6B7280
Border:           #E5E7EB
Error:            #DC2626
```

The interface is designed to remain clean, responsive, and easy to navigate across customer, farmer, and administrator workflows.

---

## Development Notes

- Payment is completed physically at pickup.
- Delivery/courier functionality is outside the project scope.
- Seed credentials must never be used as production credentials.
- The seed script is intended for development and project demonstrations.
- Product availability and order states are deliberately varied in the demo dataset.
- Some optional or extended features may depend on the final submitted version of the application.

---

## Future Improvements

Possible future extensions include:

- Improved map/directions integration
- Restock subscriptions
- Email notifications
- Image/file upload storage
- Pagination for large datasets
- More advanced search/filtering
- Database transactions for high-concurrency stock reservations
- Expanded customer profile management
- Password reset/recovery
- Additional analytics
- Optional AI marketplace assistant

---

## AI Usage Acknowledgement

AI-assisted tools were used during development as supporting tools for activities such as planning, debugging, code review, implementation guidance, and development productivity.

The project should be understood and maintained by its developers, including its architecture, business logic, database relationships, authentication flow, API behavior, and frontend/backend integration.

---

## Project Status

**MarketLink v1.0**

Core customer, farmer, administrator, marketplace, inventory, preorder, pickup, authentication, authorization, reporting, and database functionality implemented for the project demonstration.

---

## License

This project was developed for educational/project purposes.
