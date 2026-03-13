const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    contactPerson: { type: String },
    phone: { type: String, required: true, unique: true, match: [/^\d{10}$/, "Phone must be exactly 10 digits"] },
    email: { type: String },
    address: { type: String },
    category: { type: String }, // e.g., "Casual", "Formal", "Fabric"
    balance: { type: Number, default: 0 }, // Amount we owe the supplier
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Supplier", supplierSchema);
