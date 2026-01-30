const mongoose = require("mongoose");

const clothesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

module.exports = mongoose.model("Clothes", clothesSchema);
