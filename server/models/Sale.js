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
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sale", saleSchema);
