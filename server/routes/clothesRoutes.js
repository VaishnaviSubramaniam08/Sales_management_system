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
    const { name, category, size, color, price, costPrice, quantity, reorderLevel, supplier, image: imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : (imageUrl || "");

    const cloth = new Clothes({
      name,
      category,
      size,
      color,
      price,
      costPrice,
      quantity,
      image,
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
    } else if (req.body.image) {
      updateData.image = req.body.image;
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
   BULK IMPORT (Detailed)
   ====================== */
router.post("/bulk-import", admin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: "Invalid input" });

    let successCount = 0;
    let failures = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
            // Mapping & Validation
            const name = item.name?.trim();
            if (!name) throw new Error("Missing name");


            const cloth = new Clothes({
                name,
                category: item.category?.trim() || "Uncategorized",
                size: item.size?.trim() || "Standard",
                color: item.color?.trim() || "N/A",
                price: Number(item.price) || 0,
                costPrice: Number(item.costPrice || item.costprice) || 0,
                quantity: Number(item.quantity) || 0,
                supplier: item.supplier || undefined
            });

            await cloth.save();
            successCount++;
        } catch (err) {
            failures.push({
                row: i + 2, // 1 for header, 1 for 0-index
                name: item.name || "Unknown",
                reason: err.message
            });
            console.error(`Import failed at row ${i+2}: ${err.message}`);
        }
    }

    res.json({ 
        message: `${successCount} clothes imported successfully`,
        details: {
            total: items.length,
            success: successCount,
            failed: failures.length,
            failures: failures
        }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
