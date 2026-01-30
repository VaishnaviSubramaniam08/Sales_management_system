const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  items: [
    {
      clothId: { type: mongoose.Schema.Types.ObjectId, ref: "Clothes" },
      quantity: Number,
      price: Number,
    },
  ],
  totalAmount: Number,
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Failed"],
    default: "Pending",
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sale", saleSchema);
