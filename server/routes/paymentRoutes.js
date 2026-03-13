const express = require("express");
const Payment = require("../models/Payment");
const Sale = require("../models/Sale");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
//const Razorpay = require("razorpay");
const crypto = require("crypto");

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

router.use(protect);

/* ======================
   CREATE RAZORPAY ORDER
   ====================== */
router.post("/create-order", async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes("YOUR_KEY_ID")) {
            return res.status(400).json({ 
                message: "Razorpay keys are not configured in .env. Please update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." 
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        res.json({ ...order, key_id: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        res.status(500).json({ message: "Error creating Razorpay order", error: err.message });
    }
});

/* ======================
   VERIFY RAZORPAY PAYMENT
   ====================== */
router.post("/verify", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            saleId
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment verified, now update sale
            const sale = await Sale.findById(saleId);
            if (!sale) return res.status(404).json({ message: "Sale not found" });

            const payment = new Payment({
                saleId,
                amount: sale.totalAmount,
                method: "UPI/Razorpay",
                transactionId: razorpay_payment_id,
                status: "Paid"
            });
            await payment.save();

            sale.paymentId = payment._id;
            sale.paymentStatus = "Paid";
            await sale.save();

            res.json({ message: "Payment verified successfully", payment });
        } else {
            res.status(400).json({ message: "Invalid signature, payment verification failed" });
        }
    } catch (err) {
        res.status(500).json({ message: "Verification error", error: err.message });
    }
});

/* ======================
   PROCESS PAYMENT
   ====================== */
router.post("/process", async (req, res) => {
    try {
        const { saleId, amount, method, transactionId } = req.body;

        // 1. Validate Sale
        const sale = await Sale.findById(saleId);
        if (!sale) return res.status(404).json({ message: "Sale not found" });

        // 3. Handle Store Credit
        if (method === "StoreCredit") {
            const Customer = require("../models/Customer");
            const customer = await Customer.findById(sale.customerId);
            if (!customer) return res.status(400).json({ message: "Customer not found for Store Credit" });
            if (customer.storeCredit < amount) {
                return res.status(400).json({ message: `Insufficient Store Credit. Available: ₹${customer.storeCredit}` });
            }
            customer.storeCredit -= amount;
            await customer.save();
        }

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
