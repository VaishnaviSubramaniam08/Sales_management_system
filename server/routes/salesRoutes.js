const express = require("express");
const Clothes = require("../models/Clothes");
const Sale = require("../models/Sale");
const { Parser } = require("json2csv");

const { protect, admin } = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit");

const router = express.Router();

router.use(protect);

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

    const sale = new Sale({
      items,
      totalAmount,
      soldBy: req.user.id
    });
    await sale.save();

    res.json({ message: "Sale completed", sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   SALES HISTORY
   ====================== */
router.get("/", async (req, res) => {
  let query = {};
  if (req.user.role !== "admin") {
    query.soldBy = req.user.id;
  }
  const sales = await Sale.find(query).populate("soldBy", "name").sort({ date: -1 });
  res.json(sales);
});

/* ======================
   DASHBOARD SUMMARY
   ====================== */
/* ======================
   DASHBOARD SUMMARY
   ====================== */
router.get("/dashboard", async (req, res) => {
  // If staff, only show their stats? Or show store stats?
  // Requirement: "View daily sales count" (Staff) vs "Total products, Total stock, Total sales" (Admin)
  // For now, let's keep it simple. If staff, maybe filter?
  // The requirement says Staff: "View available stock, View daily sales count".
  // Admin: "Total sales, Revenue summary".

  // Let's stick to global stats for Admin, and maybe personal for Staff.
  // Current implementation was global.
  // Let's just protect it for now.
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
   PDF REPORT
   ====================== */
router.get("/report/pdf", admin, async (req, res) => {
  try {
    const doc = new PDFDocument();

    // Populate items.clothId to get name
    const sales = await Sale.find()
      .populate("soldBy", "name")
      .populate("items.clothId", "name");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.moveDown();

    sales.forEach((sale) => {
      doc.fontSize(14).text(`Date: ${new Date(sale.date).toLocaleDateString()}`);
      doc.fontSize(12).text(`Sold By: ${sale.soldBy ? sale.soldBy.name : "N/A"}`);
      doc.text(`Total: Rs. ${sale.totalAmount}`);

      doc.moveDown(0.5);
      sale.items.forEach((item) => {
        const clothName = item.clothId ? item.clothId.name : "Deleted Item";
        doc.text(`- ${clothName} (Qty: ${item.quantity}) = Rs. ${item.price * item.quantity}`);
      });

      doc.moveDown();
      doc.text("-------------------------------------------------");
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
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

/* ======================
   INVOICE (Single Sale)
   ====================== */
router.get("/invoice/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.clothId")
      .populate("soldBy");

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${sale._id}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${sale._id}`);
    doc.text(`Date: ${new Date(sale.date).toLocaleString()}`);
    doc.text(`Sold By: ${sale.soldBy?.name || "N/A"}`);
    doc.moveDown();

    doc.text("-------------------------------------------------");
    sale.items.forEach(item => {
      doc.text(`${item.clothId?.name || "Item"} x ${item.quantity} = Rs. ${item.price * item.quantity}`);
    });
    doc.text("-------------------------------------------------");
    doc.fontSize(14).text(`Total Amount: Rs. ${sale.totalAmount}`, { align: "right" });

    if (sale.paymentStatus === "Paid") {
      doc.moveDown();
      doc.fillColor("green").text("PAID", { align: "center" });
    }

    doc.end();

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
