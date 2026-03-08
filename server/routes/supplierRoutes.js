const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc Get all suppliers
// @access Admin only
router.get("/", protect, admin, async (req, res) => {
    try {
        const suppliers = await Supplier.find({}).sort({ name: 1 });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc Add new supplier
// @access Admin only
router.post("/add", protect, admin, async (req, res) => {
    const { name, contactPerson, phone, email, address, category } = req.body;
    try {
        const exists = await Supplier.findOne({ phone });
        if (exists) return res.status(400).json({ message: "Supplier with this phone already exists" });

        const supplier = new Supplier({ name, contactPerson, phone, email, address, category });
        await supplier.save();
        res.status(201).json(supplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc Update supplier
// @access Admin only
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(supplier);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc Delete supplier
// @access Admin only
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: "Supplier deleted" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
