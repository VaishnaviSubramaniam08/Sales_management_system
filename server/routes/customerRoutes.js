const express = require("express");
const Customer = require("../models/Customer");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect);

// Create Customer
router.post("/add", async (req, res) => {
    try {
        const { name, phone } = req.body;
        const exists = await Customer.findOne({ phone });
        if (exists) return res.status(400).json({ message: "Customer already exists" });

        const customer = new Customer({ name, phone });
        await customer.save();
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search Customer
router.get("/search", async (req, res) => {
    try {
        const { query } = req.query;
        // If query is empty, return top 10 recent
        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { phone: { $regex: query, $options: "i" } }
                ]
            };
        }

        const customers = await Customer.find(filter).limit(10);
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Customer by ID
router.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

// Loyalty eligibility: returns current tier and recommended discount
// GET /api/customers/loyalty/:id
router.get("/loyalty/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Parse tiers from env: e.g., "50000:10,25000:5,10000:2"
    const tiersStr = process.env.LOYALTY_TIERS || "50000:10,25000:5,10000:2";
    const tiers = tiersStr
      .split(",")
      .map((pair) => pair.trim())
      .filter(Boolean)
      .map((pair) => {
        const [spent, pct] = pair.split(":");
        return { spent: Number(spent), percent: Number(pct) };
      })
      .filter((t) => !Number.isNaN(t.spent) && !Number.isNaN(t.percent))
      .sort((a, b) => b.spent - a.spent);

    let eligible = { percent: 0, tierSpent: 0 };
    for (const t of tiers) {
      if (customer.totalSpent >= t.spent) {
        eligible = { percent: t.percent, tierSpent: t.spent };
        break;
      }
    }

    res.json({
      customerId: String(customer._id),
      totalSpent: customer.totalSpent,
      visitCount: customer.visitCount,
      tierSpent: eligible.tierSpent,
      discountPercent: eligible.percent,
      tiers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
