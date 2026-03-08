# Full Project Implementation Details

This document provides a comprehensive technical overview of the Retail Management System.

## 1. System Architecture
The project follows a MERN stack architecture with an Electron wrapper for desktop capabilities.

- **Frontend**: React (SPA) with React Router for navigation.
- **Backend**: Node.js & Express.js REST API.
- **Database**: MongoDB (NoSQL) for flexible data modeling.
- **Desktop**: Electron integration for native OS features (system tray, local file access).

---

## 2. Authentication & Security
- **JWT Authentication**: Secured using JSON Web Tokens. Tokens are stored in `localStorage` and sent via `Authorization` headers.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to inventory (CRUD), staff management, and oversight reports.
  - **Staff**: Access to Sales, Returns, and basic Inventory viewing.
- **Middleware**: `protect` and `admin` middlewares in the backend ensure endpoint security.
- **Frontend Guards**: `ProtectedRoute` and `AdminRoute` components prevent unauthorized UI access.

---

## 3. Inventory Management
- **Product Model**: Stores name, category, size, color, price, quantity, image, and barcode.
- **File Handling**: `multer` is used for processing and storing product images in the `uploads/` directory.
- **Low Stock System**: 
  - Each item has a `reorderLevel`.
  - The system triggers alerts when `quantity <= reorderLevel`.
- **Barcode Integration**:
  - **Generation**: Uses `jsbarcode` to create `CODE128` SVG barcodes.
  - **Printing**: Custom print logic extracts SVG content for physical label printing.
  - **Auto-creation**: System generates unique codes (timestamp-based) if manual barcodes aren't provided.

---

## 4. Sales & Billing
- **Sales Engine**: Handles multi-item transactions, atomic stock deduction, and payment record creation.
- **Dynamic Pricing**:
  - **Old Stock Discount**: Automatic 20% discount for items older than 6 months.
  - **Festive Discount**: Optional 10% toggle for seasonal sales.
  - **Loyalty Discount**: Applied based on customer purchase history tiers.
- **Global Scanning**: Keyboard buffer listener in the Sales page allows rapid scanning without input focus.
- **Payment Modal**: Supports multiple payment methods (Cash, UPI, Card) with transaction ID tracking.

---

## 5. Customer & Loyalty Program
- **Customer Tracking**: Profiles track total spend, visit frequency, and phone numbers.
- **Loyalty Logic**: 
  - Backend calculates discount eligibility based on total lifetime spend.
  - High-value customers automatically unlock higher discount percentages.
- **Stat Persistence**: Customer stats are updated instantly upon sale completion and reversed upon returns.

---

## 6. Returns & Refunds
- **Return Processing**: Supports full or partial returns.
- **Inventory Recovery**: Returns automatically increment the stock quantity of the respective product.
- **Refund Calculation**: Deducts appropriate amounts and updates the original sale status to "Returned" or "Partial Return".

---

## 7. Reporting & Exports
- **Dashboards**: Aggregates real-time sales data for daily and monthly summaries.
- **PDF Generation**: Uses `jspdf` and `jspdf-autotable` to generate professional invoices and summary reports.
- **Data Export**: 
  - **CSV**: Exports raw transaction data for external accounting.
  - **Audit Logs**: Tracks sensitive actions for security oversight.

---

## 8. Technical Stack & Tools
- **Backend**: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `multer`.
- **Frontend**: `react`, `react-router-dom`, `axios`, `jsbarcode`, `jspdf`, `framer-motion` (for animations).
- **Desktop**: `electron`.
