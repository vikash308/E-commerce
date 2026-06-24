# VikaStore E-Commerce Platform - Complete Master Guide

VikaStore is a premium, feature-rich, multi-vendor e-commerce web application built using modern web standards. It delivers a fast, secure, and visually stunning shopping experience for customers while providing robust management dashboards for independent sellers and system administrators.

---

## 🛠️ 1. Complete Technology Stack & Core Architectures

### Frontend Client-Side
* **Core Runtime & Build Tool**: **React 19** powered by **Vite** for optimized build times, compilation, and hot module replacement.
* **State Management**: **Redux Toolkit** (centralized slices managing Auth, Cart, Wishlist, Orders, Products, Categories, and Users).
* **HTTP Client & Network Interceptors**: **Axios** wrapper with automated response interceptors:
  * **Automatic Silent JWT Token Refresh**: If an API call fails with a `401 Unauthorized` status, Axios intercepts the response, triggers a `/auth/refresh-token` request to renew the access token, saves it, and retries the original request seamlessly.
  * **Subscriber Queueing**: Resolves multiple parallel request failures during token renewal by holding them in a queue and resolving them simultaneously once the new token is acquired.
  * **Auto-Logout**: If token refresh fails (session expired), the client automatically wipes local auth tokens and redirects to `/login`.
* **Styling & Design System**: Hand-crafted **Vanilla CSS** with HSL token values:
  * **Premium Dark Mode**: Sleek deep-dark backgrounds (`#090b11`) paired with glow glassmorphism cards and translucent borders.
  * **Micro-Animations**: Hover scales, pulse effects on key notices, fade-in loaders, and skeleton components.
* **Routing Engine**: **React Router DOM (v6)** using nested layouts, dynamic components, and role guards (`ProtectedRoute`, `AdminRoute`, `SellerRoute`).
* **Icons**: Clean vectors from **Lucide React**.

### Backend API Server
* **Runtime & Framework**: **Node.js** with **Express.js** running a structured MVC architecture.
* **Database**: **MongoDB** with **Mongoose ODM** for modeling collections and handling relationships.
* **Dual-Token Authentication**: Secure JWT issuing of short-lived `AccessToken` (in request headers) and long-lived `RefreshToken` (stored in DB and localStorage).
* **Security & Performance Layers**:
  * `helmet`: Configures secure HTTP headers to shield against clickjacking and other exploits.
  * `cors`: Cross-Origin Resource Sharing locked down to trusted client domains (`http://localhost:5173`).
  * `express-rate-limit`: Custom rate limiters protect login/register endpoints from brute force and denial of service.
  * Custom XSS Sanitizer: Middleware that recursively strips HTML tags and executable scripts from requests (`body`, `query`, `params`) to block XSS injections.
  * `express-validator`: Enforces payload validation schemas before controllers execute.

---

## 🔌 2. Third-Party Integrations & Cloud Services

### A. Stripe Payment Gateway
* **Stripe Hosted Checkout**: Fully integrated using the official `@stripe/stripe-js` on the frontend and the backend `stripe` SDK.
* **Dynamic Sessions**: Creates online checkout links by mapping item details, pricing, and redirects (`success_url` and `cancel_url`).
* ** red-carpet Redirection**: Secure billing on Stripe's official PCI-DSS compliant interface.
* **Verification Pipeline**: Frontend reads URL query parameters on return and triggers the `/stripe-confirm` endpoint. The backend verifies the transaction state directly with Stripe API before updating MongoDB.

### B. Razorpay Payment Gateway
* **Razorpay Checkout Modal**: Fully integrated on the frontend by dynamically loading `https://checkout.razorpay.com/v1/checkout.js` and opening the native checkout modal.
* **Backend Order Generation**: Implemented `/orders/:id/razorpay-order` to dynamically initiate Razorpay orders using order receipts and currency codes.
* **Signature Verification**: Added backend verification endpoint `/orders/:id/razorpay-confirm` which calculates and verifies the signature using a secure SHA-256 HMAC of the parameters `razorpay_order_id + "|" + razorpay_payment_id` against the `RAZORPAY_KEY_SECRET`.

### B. Cloudinary Image Storage
* **Dynamic Stream Uploads**: Integrates the `cloudinary` SDK to upload image file buffers directly from the server's memory stream.
* **Storage Synchronisation**: Securely saves the generated Cloudinary `secure_url` and `public_id` on the product schema.
* **Automatic Garbage Collection**: During product deletion or update events, the backend triggers `cloudinary.uploader.destroy(publicId)` to delete outdated image assets from Cloudinary.

### C. Multer File Upload Middleware
* **Memory Buffer Configuration**: Configures `multer.memoryStorage()` to handle multipart form data uploads inside memory buffers.
* **MIME Filter Protection**: Rejects file extensions not matching `/jpeg|jpg|png|webp|gif/`.
* **File Size Ceiling**: Sets a strict limit of `5MB` per file to prevent disk exhaustion.

### D. Nodemailer Email Services
* **SMTP Mailer Transport**: Integrated via `nodemailer` to dispatch account notifications and password reset recovery links to user emails.
* **Dynamic SMTP Options**: Configured via variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SERVICE`, `SMTP_MAIL`, and `SMTP_PASSWORD`).
* **Developer Logger Fallback**: If SMTP variables are left blank or placeholder-like in `.env`, Nodemailer automatically catches this state, suppresses mail errors, and prints the generated password reset links directly to the backend terminal console log for testing.

---

## 🌟 3. Complete Feature Catalog & Advantages

### A. Customer Experience (Storefront & Profile)

#### 1. Interactive Homepage (`Home.jsx`)
* **Hero Banner Carousel**: Interactive, beautifully aligned promo slides showcasing featured collections with smooth transitions.
* **Category Quick Navigation**: Highlighting store categories (e.g. Electronics, Clothing, Accessories) with direct links.
* **Featured & Trending Products**: Dynamically loads best-rated and trending inventory cards.
* **Advantages**: High engagement rate, instant access to search, and a visual theme that immediately captures visitor interest.

#### 2. Advanced Search & Catalog Browsing (`Products.jsx` & `ProductDetails.jsx`)
* **Live Search**: Users can type keywords to filter products instantly.
* **Multi-Filter Sidebar**: Filter items by category, price ranges, and ratings.
* **Sorting Engine**: Sort products by Price (Low to High, High to Low), Popularity, and Date Added.
* **Product Detail Page**:
  * **Image Gallery**: Renders multiple views of the product.
  * **Inventory Tracker**: Displays explicit stock counts (e.g., "Only 3 items left" or "Out of Stock" badges).
  * **Dynamic Review & Rating Box**: Users can leave a 1-to-5 star rating and comment feedback. Calculates average stars dynamically.
* **Advantages**: Transparent stock status encourages purchases, and review sections build social proof and consumer trust.

#### 3. Seamless Wishlist & Cart Systems (`Wishlist.jsx` & `Cart.jsx`)
* **Wishlist**: Save favorite items. Includes a one-click "Move to Cart" utility.
* **Shopping Cart**:
  * Live quantity updating with automatic stock checks (disables `+` button when stock limit is reached).
  * Auto-calculates Subtotal, Shipping (Free on orders > $100, else $10), Tax (15% VAT), and Grand Total.
  * Integrated checkout form collects shipping details (Address, City, Postal code, Country) with auto-save.
* **Advantages**: Prevents overselling by matching cart controls with backend stock levels; provides clear pricing before checkout.

#### 4. Secured Payment Portal (`Payment.jsx` & `OrderSuccess.jsx`)
* **Official Stripe hosted gateway**: Redirects to a secure, PCI-compliant Stripe billing page where users enter credit/debit card details.
* **Cash on Delivery (COD)**: Instantly processes order, marks it as `'Processing'` (confirmed) and `'Unpaid'`, and decrements product inventory.
* **Visual Delight (Success Page)**:
  * Triggers a rich, responsive Confetti celebration using HTML5 Canvas.
  * Automatically stops after 6 seconds to optimize browser CPU performance.
  * Tells customers their estimated delivery date (4 business days from order placement).
* **Resumable Transactions**: If a user cancels during card entry, the order is saved under the "My Orders" tab. Customers can resume the session later by clicking **"Pay Now"**.
* **Advantages**: Highly secure payments reduce cart abandonment; the "Pay Now" feature recaptures lost sales; confetti creates a memorable buying experience.

#### 5. Printable Invoice Receipt Utility (`invoice.js`)
* Customers can click **"Print Invoice"** on their order success screen or orders list.
* Opens a clean, branded, print-ready receipt in a new tab and calls `window.print()` to allow instant printing or saving as a PDF.
* **Advantages**: Provides professional, standard receipts for customer convenience.

---

### B. Vendor Experience (Seller Portal)

Customers can apply to become independent sellers on the platform (`/profile` -> "Become a Seller"). Once approved by an admin, they unlock:

#### 1. Seller Dashboard (`SellerDashboard.jsx`)
* **Revenue Metrics**: Displays total seller revenue, average order values, and inventory status widgets.
* **Product Management**:
  * Add new products with title, price, stock quantity, description, category, and up to 5 image uploads.
  * Edit and update existing product details and stock.
  * Delete inventory listings.
* **Order Fulfillments**:
  * Tracks order lines containing *only* their products.
  * View customer name, email, and shipping address.
  * Change status (Pending -> Processing -> Shipped -> Delivered) to update the customer.
* **Advantages**: Empower independent merchants with total control over their catalog, sales figures, and dispatch workflows.

---

### C. Administrator Experience (Admin Panel)

System administrators get a secure, global command center (`/admin` layout):

#### 1. Admin Management Control Page
* **KPI Metrics Board**: Tracks total store-wide revenue (calculated from paid orders), overall order count, total user accounts, and current active inventory sizes.
* **User Manager & Seller Applications**:
  * Complete list of platform users.
  * Change roles (toggle between Customer, Seller, and Admin).
  * **Seller Request Approvals**: Approve or reject pending seller applications.
  * **Demotion Safety**: If an admin demotes a seller back to a customer, the system automatically resets their seller request status, letting the user re-apply in the future.
* **Category Editor**: Create, modify, and delete product categories to keep the catalog clean.
* **Global Order Controller**: View all orders placed across the site and manually adjust statuses or cancel orders.
* **Advantages**: Easily monitor site-wide operations, review seller applications, and handle customer service escalations in one place.

---

## 📁 4. Project Directory Map

### Backend (Node/Express Server)
```
backend/
├── src/
│   ├── config/             # Database connection & Stripe SDK configs
│   ├── controllers/        # Route logic (Auth, Product, Order, User, Category)
│   ├── middlewares/        # Security, Auth Guards, Error handlers, Multer Upload, Validators
│   ├── models/             # Mongoose Schemas (User, Product, Order, Category, Cart)
│   ├── routes/             # API Endpoints
│   ├── services/           # Nodemailer email sender
│   ├── utils/              # Helper utilities
│   ├── app.js              # Express app initialization
│   └── server.js           # Server startup script
├── .env                    # Secrets (Database URL, JWT keys, Stripe secrets)
└── package.json
```

### Frontend (React Application)
```
frontend/
├── src/
│   ├── components/         # Shared layouts (Navbar, Footer, AdminLayout, SellerLayout, Loading states)
│   ├── pages/              # Page Views (Home, Login, Register, Cart, Wishlist, Orders, Profile, Payment, Success)
│   ├── store/              # Redux slices (authSlice, cartSlice, wishlistSlice, productSlice, orderSlice, userSlice)
│   ├── utils/              # Printable Invoice generator & showToast triggers
│   ├── index.css           # Global CSS variables, HSL theme values, glassmorphism cards, grids
│   ├── main.jsx            # React mounting script
│   └── App.jsx             # Route definitions and Redux Store bindings
└── package.json
```

---

## 🚀 5. Installation & Environment Configuration

### Environmental Settings (`backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ecom
JWT_ACCESS_SECRET=your_jwt_access_secret_key_12345
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_12345
JWT_REFRESH_EXPIRE=7d

# Nodemailer SMTP Configuration
SMTP_MAIL=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail

# Cloudinary Integration API Keys
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe Integration Credentials
STRIPE_SECRET_KEY=sk_test_51...your_stripe_test_secret_key

# Razorpay Integration Credentials
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

FRONTEND_URL=http://localhost:5173
```

### Run Commands

1. **Start MongoDB**: Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017/ecom`.
2. **Database Seeding**: Populate categories and products:
   ```bash
   cd backend
   npm run seed
   ```
3. **Start Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
4. **Start Frontend Server**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
5. **Access Portal**: Open `http://localhost:5173` in your browser.
