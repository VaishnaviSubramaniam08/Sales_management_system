const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
    saleId: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
    items: [{
        clothId: { type: mongoose.Schema.Types.ObjectId, ref: "Clothes" },
        quantity: { type: Number, required: true },
        reason: { type: String }
    }],
    refundAmount: { type: Number, required: true },
    approvalStatus: { type: String, enum: ["approved", "pending", "rejected"], default: "approved" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // staff who processed or attempted return
    expirationAttempt: { type: Boolean, default: false }, // If true, return was rejected automatically due to 10-day limit
    approvedAt: { type: Date },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Return", returnSchema);
