const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  items: [
    {
      clothId: { type: mongoose.Schema.Types.ObjectId, ref: "Clothes" },
      name: String,
      quantity: Number,
      costPrice: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Sent", "Received", "Cancelled"],
    default: "Pending",
  },
  expectedDate: { type: Date },
  receivedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
