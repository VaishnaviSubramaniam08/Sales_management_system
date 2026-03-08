const mongoose = require("mongoose");

const clothesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true, default: 0 },
  quantity: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  image: { type: String },
  barcode: { type: String, unique: true, sparse: true },
  reorderLevel: { type: Number, default: 5 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Clothes", clothesSchema);
