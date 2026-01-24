const express = require("express");
const Clothes = require("../models/Clothes");
const Sale = require("../models/Sale");
const { Parser } = require("json2csv");

const router = express.Router();

/* ======================
   CREATE SALE + UPDATE STOCK
   ====================== */
router.post("/add", async (req, res) => {
  try {
    const { items } = req.body;
    let totalAmount = 0;

    for (let item of items) {
      const cloth = await Clothes.findById(item.clothId);

      if (!cloth)
        return res.status(404).json({ message: "Cloth not found" });

      if (cloth.quantity < item.quantity)
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${cloth.name}` });

      cloth.quantity -= item.quantity;
      await cloth.save();

      item.price = cloth.price;
      totalAmount += cloth.price * item.quantity;
    }

    const sale = new Sale({ items, totalAmount });
    await sale.save();

    res.json({ message: "Sale completed", totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   SALES HISTORY
   ====================== */
router.get("/", async (req, res) => {
  const sales = await Sale.find().sort({ date: -1 });
  res.json(sales);
});

/* ======================
   DASHBOARD SUMMARY
   ====================== */
router.get("/dashboard", async (req, res) => {
  const totalSales = await Sale.countDocuments();
  const revenue = await Sale.aggregate([
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  res.json({
    totalSales,
    totalRevenue: revenue[0]?.total || 0,
  });
});

/* ======================
   CSV REPORT
   ====================== */
router.get("/report/csv", async (req, res) => {
  const sales = await Sale.find();
  const parser = new Parser({
    fields: ["_id", "date", "totalAmount"],
  });

  const csv = parser.parse(sales);
  res.header("Content-Type", "text/csv");
  res.attachment("sales_report.csv");
  res.send(csv);
});

module.exports = router;
