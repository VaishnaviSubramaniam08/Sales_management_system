const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "staff"], required: true },
  status: { type: String, enum: ["active", "inactive", "pending", "approved", "rejected", "deactivated"], default: "active" },
  exitDate: { type: Date },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String }, // For simulation, could be a code
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
