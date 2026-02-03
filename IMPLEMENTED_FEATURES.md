# Implemented Features

This document outlines the core features implemented in the **Consultancy Project** (Retail Management System).

## 1. Authentication & Security
- **JWT-Based Authentication**: Secure login and session management using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Admin** and **Staff** roles.
- **Password Hashing**: Secure storage of user credentials using `bcryptjs`.
- **Protected Routes**: Middleware to ensure only authorized users can access specific API endpoints.

## 2. Inventory Management
- **Clothes/Product CRUD**: Add, view, update, and delete inventory items (Admin only).
- **Image Uploads**: Support for product images using `multer` storage.
- **Barcode Integration**: Search and retrieve product details via barcode scanning.
- **Advanced Filtering**: Search items by name and filter by price ranges.
- **Low Stock Alerts**: Automated system to identify products falling below a specified quantity threshold.

## 3. Sales & Billing
- **Sales Transaction Processing**: Create sales with multi-item support and automated stock deduction.
- **Discount Management**: Apply global or item-level discounts during checkout.
- **Invoice Generation**: Automated generation of professional **PDF Invoices** for every sale.
- **Sales History**: Track and view past transactions with details on products sold and the staff member responsible.

## 4. Reporting & Analytics
- **Dashboard Summary**: Real-time stats for total sales and revenue.
- **PDF Reports**: Export detailed sales reports with date-wise breakdowns and itemized lists.
- **CSV Reports**: Export sales data to CSV format for external analysis in Excel or other tools.

## 5. Customer Management
- **Customer Profiles**: Store customer names and contact information.
- **Loyalty Tracking**: Automatically track **Total Spent**, **Visit Count**, and **Last Visit Date** based on purchase history.
- **Search Functionality**: Quickly find customers by name or phone number.

## 6. Returns & Refunds
- **Return Processing**: Process full or partial returns with automated inventory restock.
- **Refund Logic**: Calculate refund amounts and update sale statuses (e.g., "Returned" or "Partial Return").
- **Customer Stat Reversal**: Automatically adjust customer spending stats upon processing a return.

## 7. Payment Management
- **Payment Tracking**: Record payment methods (Cash, Card, etc.) and transaction IDs.
- **Payment History**: View history of all processed payments linked to their respective sales.
