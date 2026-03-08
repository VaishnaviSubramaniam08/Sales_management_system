const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  items: [
    {
      clothId: { type: mongoose.Schema.Types.ObjectId, ref: "Clothes" },
      quantity: Number,
      price: Number,
      costPrice: Number,
    },
  ],
  totalAmount: Number,
  soldBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  discountDetails: {
    type: { type: String },
    amount: { type: Number, default: 0 }
  },
  taxDetails: {
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ["Completed", "Returned", "Partial Return"],
    default: "Completed"
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Pending", "Failed"],
    default: "Pending",
  },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sale", saleSchema);
