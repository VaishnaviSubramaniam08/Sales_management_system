const mongoose = require("mongoose");

const damagedInventorySchema = new mongoose.Schema({
    damage_id: { type: String, unique: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Clothes", required: true },
    sale_id: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
    staff_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    return_date: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ["damaged", "written_off", "repaired_to_inventory"],
        default: "damaged"
    },
    notes: { type: String }
});

module.exports = mongoose.model("DamagedInventory", damagedInventorySchema);
