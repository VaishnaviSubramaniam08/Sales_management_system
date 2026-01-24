const express = require("express");
const Clothes = require("../models/Clothes");

const router = express.Router();

/* ======================
   CREATE (Add Clothes)
   ====================== */
router.post("/add", async (req, res) => {
  try {
    const cloth = new Clothes(req.body);
    await cloth.save();
    res.json({ message: "Clothes added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   READ (All Clothes)
   ====================== */
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const clothes = await Clothes.find(query);
    res.json(clothes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   READ (Single Cloth)
   ====================== */
router.get("/:id", async (req, res) => {
  try {
    const cloth = await Clothes.findById(req.params.id);
    res.json(cloth);
  } catch (err) {
    res.status(404).json({ error: "Cloth not found" });
  }
});

/* ======================
   UPDATE
   ====================== */
router.put("/:id", async (req, res) => {
  try {
    await Clothes.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Clothes updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   DELETE
   ====================== */
router.delete("/:id", async (req, res) => {
  try {
    await Clothes.findByIdAndDelete(req.params.id);
    res.json({ message: "Clothes deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   LOW STOCK ALERT
   ====================== */
router.get("/alerts/low-stock", async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const items = await Clothes.find({ quantity: { $lte: threshold } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
