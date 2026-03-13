const express = require("express");
const Return = require("../models/Return");
const Sale = require("../models/Sale");
const Clothes = require("../models/Clothes");
const DamagedInventory = require("../models/DamagedInventory");
const Customer = require("../models/Customer");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);

// Reasons that allow restocking
const RESTOCK_REASONS = ["Size Issue", "Color Change", "Customer Changed Mind", "Wrong Product Delivered"];
const DAMAGED_REASONS = ["Defective / Damaged"];

// Process a Return
router.post("/add", async (req, res) => {
    const { saleId, items, refundAmount } = req.body;

    try {
        // 1. Fetch Sale and check Expiry Date Limit
        const sale = await Sale.findById(saleId);
        if(!sale) return res.status(404).json({ error: "Associated Sale not found" });

        const saleDate = new Date(sale.date);
        const returnDeadline = new Date(saleDate.getTime() + 10 * 24 * 60 * 60 * 1000);
        const isExpired = new Date() > returnDeadline;

        if (isExpired) {
            const failedReturn = new Return({
                saleId, items, refundAmount,
                approvalStatus: "rejected",
                staffId: req.user.id,
                expirationAttempt: true
            });
            await failedReturn.save();
            return res.status(400).json({ error: "Refund not possible. Return period expired." });
        }

        // 2. Create Return Record
        const threshold = Number(process.env.HIGH_RETURN_APPROVAL || 0);
        const approvalNeeded = threshold > 0 && Number(refundAmount) >= threshold;
        const returnRecord = new Return({
            saleId, items, refundAmount,
            approvalStatus: approvalNeeded ? "pending" : "approved",
            approvedBy: approvalNeeded ? undefined : req.user.id,
            staffId: req.user.id,
            expirationAttempt: false,
            approvedAt: approvalNeeded ? undefined : new Date()
        });
        await returnRecord.save();

        // 3. Conditional Inventory Update per item based on return reason
        if (!approvalNeeded) {
            for (let item of items) {
                if (item.quantity > 0) {
                    const reason = item.reason || "Customer Changed Mind";
                    if (DAMAGED_REASONS.includes(reason)) {
                        // Defective: log to damaged inventory, do NOT restock
                        const dmgCount = await DamagedInventory.countDocuments();
                        await DamagedInventory.create({
                            damage_id: `DMG-${new Date().getFullYear()}-${String(dmgCount + 1).padStart(5, '0')}`,
                            product_id: item.clothId,
                            sale_id: saleId,
                            staff_id: req.user.id,
                            quantity: item.quantity,
                            reason
                        });
                    } else if (RESTOCK_REASONS.includes(reason)) {
                        // All other valid reasons: restock back to inventory
                        await Clothes.findByIdAndUpdate(item.clothId, { $inc: { quantity: item.quantity } });
                    }
                }
            }
        }

        // 4. Update Sale Status
        if (!approvalNeeded) {
            sale.status = refundAmount >= sale.totalAmount ? "Returned" : "Partial Return";
            await sale.save();
        }

        // 5. Update Customer Stats
        if (sale.customerId) {
            const customer = await Customer.findById(sale.customerId);
            if (customer) {
                customer.totalSpent = Math.max(0, customer.totalSpent - refundAmount);
                await customer.save();
            }
        }

        res.json({ message: approvalNeeded ? "Return submitted for approval" : "Return processed successfully", returnRecord });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Get Returns History
router.get("/", async (req, res) => {
    try {
        const returns = await Return.find()
            .populate("saleId")
            .populate("items.clothId")
            .populate("staffId", "name")
            .sort({ date: -1 });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin approval for pending returns
router.put("/:id/approve", admin, async (req, res) => {
    try {
        const rec = await Return.findById(req.params.id);
        if (!rec) return res.status(404).json({ message: "Return not found" });
        if (rec.approvalStatus !== "pending") return res.status(400).json({ message: "Return is not pending" });

        for (let item of rec.items) {
            if (item.quantity > 0) {
                const reason = item.reason || "Customer Changed Mind";
                if (DAMAGED_REASONS.includes(reason)) {
                    const dmgCount = await DamagedInventory.countDocuments();
                    await DamagedInventory.create({
                        damage_id: `DMG-${new Date().getFullYear()}-${String(dmgCount + 1).padStart(5, '0')}`,
                        product_id: item.clothId,
                        sale_id: rec.saleId,
                        staff_id: rec.staffId,
                        quantity: item.quantity,
                        reason
                    });
                } else {
                    await Clothes.findByIdAndUpdate(item.clothId, { $inc: { quantity: item.quantity } });
                }
            }
        }

        const sale = await Sale.findById(rec.saleId);
        if (sale) {
            sale.status = rec.refundAmount >= sale.totalAmount ? "Returned" : "Partial Return";
            await sale.save();
        }

        rec.approvalStatus = "approved";
        rec.approvedBy = req.user.id;
        rec.approvedAt = new Date();
        await rec.save();
        res.json({ message: "Return approved", return: rec });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put("/:id/reject", admin, async (req, res) => {
    try {
        const rec = await Return.findById(req.params.id);
        if (!rec) return res.status(404).json({ message: "Return not found" });
        if (rec.approvalStatus !== "pending") return res.status(400).json({ message: "Return is not pending" });
        rec.approvalStatus = "rejected";
        rec.approvedBy = req.user.id;
        rec.approvedAt = new Date();
        await rec.save();
        res.json({ message: "Return rejected", return: rec });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
