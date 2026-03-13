const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    saleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    method: {
        type: String,
        enum: ["Cash", "UPI", "Card", "Wallet", "StoreCredit"],
        required: true,
    },
    transactionId: {
        type: String,
        // required only if not Cash? Let's keep it optional for Cash
        default: function () {
            return this.method === 'Cash' ? 'CASH-' + Date.now() : null;
        }
    },
    status: {
        type: String,
        enum: ["Paid", "Pending", "Failed"],
        default: "Pending",
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Payment", PaymentSchema);
