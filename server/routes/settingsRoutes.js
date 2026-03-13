const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const { protect, admin } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Set up Multer for signature uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "signature_" + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// @desc Get a setting by key
// @access Private
router.get("/:key", protect, async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (!setting) return res.status(404).json({ message: "Setting not found" });
        res.json(setting);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc Upsert a setting
// @access Admin only
router.post("/set", protect, admin, async (req, res) => {
    const { key, value, description } = req.body;
    try {
        let setting = await Settings.findOne({ key });
        if (setting) {
            setting.value = value;
            if (description) setting.description = description;
            await setting.save();
        } else {
            setting = new Settings({ key, value, description });
            await setting.save();
        }
        res.json(setting);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc Upload Signature Image
// @access Admin only
router.post("/signature", protect, admin, upload.single("signature"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided" });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        let setting = await Settings.findOne({ key: "STORE_SIGNATURE" });
        if (setting) {
            setting.value = imageUrl;
            setting.description = "Admin Signature for Delivery Challan PDF";
            await setting.save();
        } else {
            setting = new Settings({ 
                key: "STORE_SIGNATURE", 
                value: imageUrl, 
                description: "Admin Signature for Delivery Challan PDF" 
            });
            await setting.save();
        }
        
        res.json({ message: "Signature uploaded successfully", setting });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
