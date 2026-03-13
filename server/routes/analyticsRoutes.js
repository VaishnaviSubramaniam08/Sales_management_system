const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const Sale = require("../models/Sale");
const Expense = require("../models/Expense");
const Clothes = require("../models/Clothes");

// @desc Get analytics summary
// @access Admin only
router.get("/summary", protect, admin, async (req, res) => {
    try {
        const { from, to } = req.query;
        let match = {};
        if (from || to) {
            match.date = {};
            if (from) match.date.$gte = new Date(from);
            if (to) match.date.$lte = new Date(to);
        }

        // 1. Revenue & Gross Profit from Sales
        const salesStats = await Sale.aggregate([
            { $match: match },
            { $unwind: "$items" },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" }, // Note: This might double count revenue if using $unwind on items and totalAmount is per sale. Correct way:
                }
            }
        ]);

        // Correct Sales Aggregation
        const revenueData = await Sale.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalSalesCount: { $count: {} }
                }
            }
        ]);

        const costData = await Sale.aggregate([
            { $match: match },
            { $unwind: "$items" },
            {
                $group: {
                    _id: null,
                    totalCost: { $sum: { $multiply: ["$items.costPrice", "$items.quantity"] } }
                }
            }
        ]);

        // 2. Total Expenses
        const expenseData = await Expense.aggregate([
            { $match: match },
            {
                $group: {
                    _id: null,
                    totalExpense: { $sum: "$amount" }
                }
            }
        ]);

        // 3. Inventory Valuation (Current Stock Value)
        const inventoryData = await Clothes.aggregate([
            {
                $group: {
                    _id: null,
                    totalInventoryValue: { $sum: { $multiply: ["$costPrice", "$quantity"] } },
                    totalItemsCount: { $sum: "$quantity" }
                }
            }
        ]);

        const revenue = revenueData[0]?.totalRevenue || 0;
        const costOfGoodsSold = costData[0]?.totalCost || 0;
        const grossProfit = revenue - costOfGoodsSold;
        const totalExpenses = expenseData[0]?.totalExpense || 0;
        const netProfit = grossProfit - totalExpenses;

        res.json({
            revenue,
            costOfGoodsSold,
            grossProfit,
            totalExpenses,
            netProfit,
            inventoryValue: inventoryData[0]?.totalInventoryValue || 0,
            totalItemsCount: inventoryData[0]?.totalItemsCount || 0,
            totalSalesCount: revenueData[0]?.totalSalesCount || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc Get sales and profit trends (Daily)
// @access Admin only
router.get("/trends", protect, admin, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trends = await Sale.aggregate([
            { $match: { date: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    revenue: { $sum: "$totalAmount" },
                    salesCount: { $count: {} }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(trends);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc Get category distribution
// @access Admin only
router.get("/categories", protect, admin, async (req, res) => {
    try {
        const categories = await Sale.aggregate([
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "clothes",
                    localField: "items.clothId",
                    foreignField: "_id",
                    as: "clothDetails"
                }
            },
            { $unwind: "$clothDetails" },
            {
                $group: {
                    _id: "$clothDetails.category",
                    value: { $sum: "$items.quantity" }
                }
            }
        ]);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
