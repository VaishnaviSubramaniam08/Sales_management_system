const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc Get all expenses
// @access Admin only
router.get("/", protect, admin, async (req, res) => {
    try {
        const { from, to, category } = req.query;
        let query = {};
        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }
        if (category) query.category = category;

        const expenses = await Expense.find(query).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc Add new expense
// @access Admin only
router.post("/add", protect, admin, async (req, res) => {
    try {
        const { title, category, amount, description, date } = req.body;
        const expense = new Expense({
            title,
            category,
            amount,
            description,
            date: date || undefined,
            recordedBy: req.user.id
        });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc Delete expense
// @access Admin only
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: "Expense deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
