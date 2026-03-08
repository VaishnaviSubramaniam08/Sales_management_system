const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true }, // e.g., "Rent", "Salary", "Electricity", "Miscellaneous"
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Expense", expenseSchema);
