const express = require("express");
const router = express.Router();
const DamagedInventory = require("../models/DamagedInventory");
const Clothes = require("../models/Clothes");
const { protect, admin } = require("../middleware/authMiddleware");

router.use(protect);

// @desc  Get all damaged inventory (with optional filters)
// @access Admin
router.get("/", admin, async (req, res) => {
    try {
        const { from, to, product_id } = req.query;
        let query = {};
        if (from || to) {
            query.return_date = {};
            if (from) query.return_date.$gte = new Date(from);
            if (to) query.return_date.$lte = new Date(to);
        }
        if (product_id) query.product_id = product_id;

        const damaged = await DamagedInventory.find(query)
            .populate("product_id", "name category size color")
            .populate("staff_id", "name")
            .populate("sale_id", "salesId")
            .sort({ return_date: -1 });
        res.json(damaged);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc  Admin: Write off damaged stock
// @access Admin
router.route("/:id/write-off").put(admin, async (req, res) => {
    try {
        const record = await DamagedInventory.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        record.status = "written_off";
        record.notes = req.body.notes || "";
        await record.save();
        res.json({ message: "Stock written off", record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}).post(admin, async (req, res) => {
    try {
        const record = await DamagedInventory.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        record.status = "written_off";
        record.notes = req.body.notes || "";
        await record.save();
        res.json({ message: "Stock written off", record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @desc  Admin: Move damaged stock back to inventory (after repair)
// @access Admin
router.route("/:id/restore").put(admin, async (req, res) => {
    try {
        const record = await DamagedInventory.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        if (record.status !== "damaged") {
            return res.status(400).json({ message: "Only 'damaged' items can be restored" });
        }

        // Restore quantity to inventory
        await Clothes.findByIdAndUpdate(record.product_id, { $inc: { quantity: record.quantity } });

        record.status = "repaired_to_inventory";
        record.notes = req.body.notes || "Repaired and returned to stock";
        await record.save();
        res.json({ message: "Stock restored to inventory", record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}).post(admin, async (req, res) => {
    try {
        const record = await DamagedInventory.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });
        if (record.status !== "damaged") {
            return res.status(400).json({ message: "Only 'damaged' items can be restored" });
        }

        // Restore quantity to inventory
        await Clothes.findByIdAndUpdate(record.product_id, { $inc: { quantity: record.quantity } });

        record.status = "repaired_to_inventory";
        record.notes = req.body.notes || "Repaired and returned to stock";
        await record.save();
        res.json({ message: "Stock restored to inventory", record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
