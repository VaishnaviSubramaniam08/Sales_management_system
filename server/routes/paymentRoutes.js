const express = require("express");
const Payment = require("../models/Payment");
const Sale = require("../models/Sale");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

/* ======================
   PROCESS PAYMENT
   ====================== */
router.post("/process", async (req, res) => {
    try {
        const { saleId, amount, method, transactionId } = req.body;

        // 1. Validate Sale
        const sale = await Sale.findById(saleId);
        if (!sale) return res.status(404).json({ message: "Sale not found" });

        // 2. Create Payment Record
        const payment = new Payment({
            saleId,
            amount,
            method,
            transactionId: transactionId || undefined,
            status: "Paid" // Simulating success for now
        });

        await payment.save();

        // 3. Update Sale Status
        sale.paymentId = payment._id;
        sale.paymentStatus = "Paid";
        await sale.save();

        res.json({ message: "Payment successful", payment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Payment failed", error: err.message });
    }
});

/* ======================
   PAYMENT HISTORY
   ====================== */
router.get("/", async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("saleId")
            .sort({ date: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching payments" });
    }
});

module.exports = router;
