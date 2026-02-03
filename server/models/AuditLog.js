const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role: { type: String },
  action: { type: String, required: true },
  entityType: { type: String },
  entityId: { type: String },
  metadata: { type: Object },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);
