const express = require("express");
const router = express.Router();
const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");
const { protect, admin } = require("../middleware/authMiddleware");

// @desc Create a new Purchase Order
// @access Admin only
router.post("/add", protect, admin, async (req, res) => {
    try {
        const { supplier, items, totalAmount, expectedDate } = req.body;
        
        // Generate a simple order number
        const count = await PurchaseOrder.countDocuments();
        const orderNumber = `PO-${Date.now()}-${count + 1}`;

        const po = new PurchaseOrder({
            orderNumber,
            supplier,
            items,
            totalAmount,
            expectedDate,
            createdBy: req.user.id
        });

        await po.save();
        res.status(201).json(po);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc Get all Purchase Orders
// @access Admin only
router.get("/", protect, admin, async (req, res) => {
    try {
        const pos = await PurchaseOrder.find()
            .populate("supplier", "name")
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });
        res.json(pos);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc Update PO status
// @access Admin only
router.put("/status/:id", protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ message: "PO not found" });

        // If shifting to "Received", we might want to update stock?
        // For simplicity, let's just update status for now. 
        // Real implementation should update Clothes quantity.
        if (status === "Received") {
            po.receivedDate = Date.now();
            
            // Increment Supplier balance (we owe them more)
            const supplier = await Supplier.findById(po.supplier);
            if (supplier) {
                supplier.balance += po.totalAmount;
                await supplier.save();
            }

            // Real implementation: update Clothes quantity
            const Clothes = require("../models/Clothes");
            console.log(`Updating stock for PO: ${po.orderNumber}`);
            for (const item of po.items) {
                console.log(`PO Item: ${item.name}, clothId: ${item.clothId}, qty: ${item.quantity}`);
                const updatedCloth = await Clothes.findByIdAndUpdate(item.clothId, {
                    $inc: { quantity: item.quantity },
                    // Optionally update costPrice to the latest buying price
                    $set: { costPrice: item.costPrice }
                }, { new: true });
                
                if (updatedCloth) {
                    console.log(`Successfully updated ${item.name}. New quantity: ${updatedCloth.quantity}`);
                } else {
                    console.error(`FAILED to find cloth for ID: ${item.clothId}`);
                }
            }
        }

        po.status = status;
        await po.save();
        res.json(po);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
