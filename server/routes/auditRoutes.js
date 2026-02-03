const express = require("express");
const AuditLog = require("../models/AuditLog");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, admin);

// GET /api/audit?user=<id>&action=SALE_CREATE&from=2025-01-01&to=2025-12-31
router.get("/", async (req, res) => {
  try {
    const { user, action, from, to } = req.query;
    const query = {};
    if (user) query.user = user;
    if (action) query.action = action;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
