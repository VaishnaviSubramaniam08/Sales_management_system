const express = require("express");
const Return = require("../models/Return");
const Sale = require("../models/Sale");
const Clothes = require("../models/Clothes");
const Customer = require("../models/Customer"); // If we want to deduct points?
const { protect, admin } = require("../middleware/authMiddleware");
const AuditLog = require("../models/AuditLog");
const router = express.Router();

router.use(protect);

// Process a Return
router.post("/add", async (req, res) => {
    // items: [{ clothId, quantity, reason }]
    const { saleId, items, refundAmount } = req.body;

    try {
        // 1. Create Return Record (with optional approval gating)
        const threshold = Number(process.env.HIGH_RETURN_APPROVAL || 0);
        const approvalNeeded = threshold > 0 && Number(refundAmount) >= threshold;
        const returnRecord = new Return({
            saleId,
            items,
            refundAmount,
            approvalStatus: approvalNeeded ? "pending" : "approved",
            approvedBy: approvalNeeded ? undefined : req.user.id,
            approvedAt: approvalNeeded ? undefined : new Date()
        });
        await returnRecord.save();

        // Audit log
        await AuditLog.create({
          action: approvalNeeded ? "RETURN_CREATE_PENDING" : "RETURN_CREATE_APPROVED",
          user: req.user.id,
          role: req.user.role,
          entityType: "Return",
          entityId: String(returnRecord._id),
          metadata: { saleId, refundAmount, itemsCount: items?.length || 0 }
        });

        // Audit log
        await AuditLog.create({
          action: "RETURN_CREATE",
          user: req.user.id,
          role: req.user.role,
          entityType: "Return",
          entityId: String(returnRecord._id),
          metadata: { saleId, refundAmount, itemsCount: items?.length || 0 }
        });

        // 2. Update Stock (only if auto-approved)
        if (!approvalNeeded) {
            for (let item of items) {
                if (item.quantity > 0) {
                    await Clothes.findByIdAndUpdate(item.clothId, { $inc: { quantity: item.quantity } });
                }
            }
        }

        // 3. Update Sale Status
        const sale = await Sale.findById(saleId);
        if (sale) {
            // Determine if full return or partial?
            // This logic can be refined. For now, we assume if refund logic is called, it might be partial or full.
            // Let's assume passed from frontend if needed, but for now mark as "Returned" if > 0 refund.
            // But wait, if partial return, status should only change if it covers everything?
            // Simplification: Mark as "Returned" (users can inspect details).
            // Better: "Partial Return" if refundAmount < totalAmount

            if (!approvalNeeded) {
                const newStatus = refundAmount >= sale.totalAmount ? "Returned" : "Partial Return";
                sale.status = newStatus;
                await sale.save();
            }

            // 4. Update Customer Stats (Optional: Deduct points/spent)
            if (sale.customerId) {
                const customer = await Customer.findById(sale.customerId);
                if (customer) {
                    customer.totalSpent = Math.max(0, customer.totalSpent - refundAmount);
                    // Assuming 1 point per 100 spent? Let's just deduct proportional.
                    // If we had points logic, we would reverse it here.
                    await customer.save();
                }
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
        const returns = await Return.find().populate("saleId").populate("items.clothId").sort({ date: -1 });
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

        // Restock items now
        for (let item of rec.items) {
            if (item.quantity > 0) {
                await Clothes.findByIdAndUpdate(item.clothId, { $inc: { quantity: item.quantity } });
            }
        }

        // Update sale status
        const sale = await Sale.findById(rec.saleId);
        if (sale) {
            const newStatus = rec.refundAmount >= sale.totalAmount ? "Returned" : "Partial Return";
            sale.status = newStatus;
            await sale.save();
        }

        rec.approvalStatus = "approved";
        rec.approvedBy = req.user.id;
        rec.approvedAt = new Date();
        await rec.save();

        await AuditLog.create({ action: "RETURN_APPROVE", user: req.user.id, role: req.user.role, entityType: "Return", entityId: String(rec._id) });
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
        await AuditLog.create({ action: "RETURN_REJECT", user: req.user.id, role: req.user.role, entityType: "Return", entityId: String(rec._id) });
        res.json({ message: "Return rejected", return: rec });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
