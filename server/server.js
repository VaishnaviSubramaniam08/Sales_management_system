const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();

/* ======================
   MIDDLEWARES
   ====================== */
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ======================
   MONGODB CONNECTION
   ====================== */
mongoose
   .connect(process.env.MONGO_URL)
   .then(() => console.log("✅ MongoDB Connected Successfully"))
   .catch((err) =>
      console.error("❌ MongoDB Connection Failed:", err.message)
   );

/* ======================
   ROUTES
   ====================== */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/clothes", require("./routes/clothesRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/returns", require("./routes/returnRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/purchase-orders", require("./routes/purchaseOrderRoutes"));
app.use("/api/damaged-inventory", require("./routes/damagedInventoryRoutes"));

/* ======================
   HEALTH CHECK
   ====================== */
app.get("/", (req, res) => {
   res.send("🟢 Clothes Inventory API is running");
});

/* ======================
   GLOBAL ERROR HANDLER
   ====================== */
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ message: "Something went wrong!" });
});

/* ======================
   SERVER START
   ====================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`🚀 Server running on port ${PORT}`);
});
