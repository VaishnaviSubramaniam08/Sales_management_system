const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    totalSpent: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    storeCredit: { type: Number, default: 0 },
    visitCount: { type: Number, default: 0 },
    lastVisit: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Customer", customerSchema);
