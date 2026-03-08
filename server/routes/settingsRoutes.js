const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");
const { protect, admin } = require("../middleware/authMiddleware");

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

module.exports = router;
