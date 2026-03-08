const express = require("express");
const Clothes = require("../models/Clothes");
const { protect, admin } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// Protect all routes
router.use(protect);

/* ======================
   CREATE (Add Clothes)
   ====================== */
/* ======================
   CREATE (Add Clothes) - ADMIN ONLY
   ====================== */
router.post("/add", admin, upload.single("image"), async (req, res) => {
  try {
    const { name, category, size, color, price, costPrice, quantity, barcode, reorderLevel, supplier } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const cloth = new Clothes({
      name,
      category,
      size,
      color,
      price,
      costPrice,
      quantity,
      image,
      barcode,
      supplier: supplier || undefined,
      reorderLevel: reorderLevel ? Number(reorderLevel) : undefined,
    });
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
    const { search, maxPrice } = req.query;

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (maxPrice) {
      query.price = { $lte: Number(maxPrice) };
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
/* ======================
   UPDATE - ADMIN ONLY
   ====================== */
router.put("/:id", admin, upload.single("image"), async (req, res) => {
  try {
    let updateData = req.body;
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    if (typeof updateData.reorderLevel !== 'undefined') {
      updateData.reorderLevel = Number(updateData.reorderLevel);
    }
    await Clothes.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: "Clothes updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   DELETE
   ====================== */
/* ======================
   DELETE - ADMIN ONLY
   ====================== */
router.delete("/:id", admin, async (req, res) => {
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
    const threshold = req.query.threshold ? Number(req.query.threshold) : null;
    let items;
    if (threshold !== null) {
      items = await Clothes.find({ quantity: { $lte: threshold } });
    } else {
      // Use per-item reorderLevel when no threshold is provided
      items = await Clothes.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } });
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   SCAN BARCODE
   ====================== */
router.get("/barcode/:code", async (req, res) => {
  try {
    const cloth = await Clothes.findOne({ barcode: req.params.code });
    if (!cloth) return res.status(404).json({ message: "Product not found" });
    res.json(cloth);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
