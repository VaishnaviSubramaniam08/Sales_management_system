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
    approvedAt: { type: Date },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Return", returnSchema);
