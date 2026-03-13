const express = require("express");
const Clothes = require("../models/Clothes");
const Sale = require("../models/Sale");
const Settings = require("../models/Settings");
const fs = require("fs");
const path = require("path");
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
    const { items, customerId, discountDetails, taxDetails, pointsRedeemed } = req.body;
    let subtotal = 0;

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

      // Update Cart Items to include current costPrice for Profit calculation later
      item.costPrice = cloth.costPrice || 0;

      // For safety, base price from DB, but apply discount if global?
      // Let's assume frontend sends final price in item if row-level? 
      // OR we calculate standard here:
      const lineTotal = item.price * item.quantity;
      subtotal += lineTotal;
    }

    let totalAmount = subtotal;

    // Apply Global Discount if present
    if (discountDetails && discountDetails.amount) {
      totalAmount -= discountDetails.amount;
    }

    // Apply Tax if present
    if (taxDetails && taxDetails.amount) {
      totalAmount += taxDetails.amount;
    }

    // Create sale first to get the auto-generated MongoDB _id
    const sale = new Sale({
      items,
      totalAmount,
      soldBy: req.user.id,
      customerId,
      discountDetails,
      pointsRedeemed: pointsRedeemed || 0,
      taxDetails: taxDetails,
      vehicleNo: req.body.vehicleNo,
      movementFor: req.body.movementFor
    });

    // Now use the sale's _id to build the human-readable Sales ID
    const year = new Date().getFullYear();
    sale.salesId = `${sale._id.toString()}`;

    // Update Customer Stats
    if (customerId) {
      // Assuming Customer model is available, might need to require it.
      const Customer = require("../models/Customer");
      const customer = await Customer.findById(customerId);
      if (customer) {
        customer.totalSpent += totalAmount;
        customer.visitCount += 1;
        customer.lastVisit = Date.now();
        // Award 1 point for every 100 spent
        const pointsEarned = Math.floor(totalAmount / 100);
        customer.points += pointsEarned;
        
        // Deduct redeemed points
        if (pointsRedeemed && pointsRedeemed > 0) {
            customer.points -= pointsRedeemed;
        }

        await customer.save();
      }
    }

    await sale.save();

    // Check for Low Stock and trigger Email Alert
    try {
      const sendEmail = require("../utils/sendEmail");
      const lowStockItems = [];
      for (let item of items) {
        const cloth = await Clothes.findById(item.clothId);
        if (cloth && (cloth.quantity <= (cloth.reorderLevel || 5))) {
          lowStockItems.push(`${cloth.name} (Remaining: ${cloth.quantity})`);
        }
      }

      if (lowStockItems.length > 0) {
        const adminEmail = process.env.ADMIN_EMAIL;
        const subject = "⚠️ LOW STOCK ALERT - Selvalakshmi Garments";
        const text = `The following items are low in stock after Sale #${sale._id}:\n\n${lowStockItems.join("\n")}\n\nPlease restock soon.`;
        await sendEmail(adminEmail, subject, text);
      }
    } catch (emailErr) {
      console.error("Failed to send low stock alert:", emailErr.message);
    }

    res.json({ message: "Sale completed", sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   SALES HISTORY
   ====================== */
router.get("/", async (req, res) => {
  try {
    const { status, from, to, staffId } = req.query;
    let query = {};
    
    if (req.user.role !== "admin") {
      query.soldBy = req.user.id;
    } else if (staffId) {
      query.soldBy = staffId;
    }

    // Date range filter
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    let sales = await Sale.find(query)
      .populate({
        path: "soldBy",
        select: "name status"
      })
      .sort({ date: -1 });

    // Filter by User status if requested (post-populate filter or use $lookup if data heavy)
    if (status) {
      sales = sales.filter(s => s.soldBy && s.soldBy.status === status);
    }

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
   STAFF-WISE METRICS
   ====================== */
router.get("/metrics/staff", admin, async (req, res) => {
  const { from, to } = req.query;
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) match.date.$lte = new Date(to);
  }
  const result = await Sale.aggregate([
    { $match: match },
    { $group: { _id: "$soldBy", salesCount: { $count: {} }, revenue: { $sum: "$totalAmount" } } },
  ]);
  res.json(result);
});

/* ======================
   DISCOUNT VERIFICATION
   ====================== */
router.get("/discounts", admin, async (req, res) => {
  const sales = await Sale.find({ "discountDetails.amount": { $gt: 0 } })
    .populate("soldBy", "name")
    .sort({ date: -1 })
    .limit(200);
  res.json(sales);
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
   DAILY SUMMARY (Cash Closure)
   ====================== */
router.get("/daily-summary", admin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const match = {};
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = new Date(from);
      if (to) match.date.$lte = new Date(to);
    }

    const summary = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          salesCount: { $count: {} },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 60 },
    ]);

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error computing daily summary" });
  }
});

/* ======================
   INVOICE (Single Sale)
   ====================== */
router.get("/invoice/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate("items.clothId")
      .populate("soldBy")
      .populate("customerId")
      .populate("paymentId");

    if (!sale) return res.status(404).json({ message: "Sale not found" });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=sales_${sale.salesId || sale._id}.pdf`);

    doc.pipe(res);

    // --- HEADER DESIGN ---
    doc.rect(30, 30, 535, 80).stroke(); // Header border
    
    doc.fontSize(10).font('Helvetica-Bold').text("DELIVERY CHALLAN", 240, 35, { characterSpacing: 1 });
    doc.fontSize(10).font('Helvetica').text("Cell : 8526240250", 460, 35);
    
    doc.moveDown(0.5);
    doc.fontSize(22).font('Helvetica-Bold').text("SELVALAKSHMI GARMENTS", 30, 50, { align: "center", width: 535 });
    doc.fontSize(10).font('Helvetica').text("113/1, Rayapuram Main Road, TIRUPUR - 641 601.", 30, 75, { align: "center", width: 535 });
    doc.fontSize(11).font('Helvetica-Bold').text("GSTIN : 33AHMPG7052K1Z7", 30, 90, { align: "center", width: 535 });
    
    // Header Info Box
    doc.rect(30, 110, 535, 60).stroke(); // Info Box
    doc.fontSize(10).font('Helvetica');
    doc.text(`Movement For :`, 40, 115);
    doc.font('Helvetica-Bold').text(sale.movementFor || "", 120, 115);
    
    doc.lineCap('butt').moveTo(350, 110).lineTo(350, 170).stroke(); // Vertical divider
    doc.font('Helvetica').text(`Vehicle No. :`, 360, 115);
    doc.font('Helvetica-Bold').text(sale.vehicleNo || "", 440, 115);
    
    doc.moveTo(350, 130).lineTo(565, 130).stroke(); // Horizontal divider
    doc.font('Helvetica').text(`No.`, 360, 135);
    doc.font('Helvetica-Bold').text(sale.salesId || String(sale._id).slice(-6), 400, 135);

    doc.moveTo(350, 150).lineTo(565, 150).stroke(); // Horizontal divider
    doc.font('Helvetica').text(`Date :`, 360, 155);
    
    const formattedDate = new Date(sale.date).toLocaleString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
    doc.font('Helvetica-Bold').text(formattedDate, 400, 155);

    doc.moveTo(350, 170).lineTo(565, 170).stroke(); // Return expiry
    doc.font('Helvetica').text(`Return Expiry :`, 360, 175);
    const expiryDate = new Date(sale.date);
    expiryDate.setDate(expiryDate.getDate() + 10);
    doc.font('Helvetica-Bold').fillColor('#dc2626').text(expiryDate.toLocaleDateString('en-IN'), 430, 175);
    doc.fillColor('black');

    doc.font('Helvetica').text(`To. M/s.`, 40, 135);
    doc.font('Helvetica-Bold').text(sale.customerId?.name || "Cash Sale", 90, 135);
    doc.font('Helvetica').text(sale.customerId?.phone || "", 90, 150);

    // --- TABLE DESIGN ---
    const tableTop = 200;
    doc.rect(30, tableTop, 535, 330).stroke(); // Table outer
    
    // Required structure: Sl.No, Product Name, Size / Color, Quantity, Price, Subtotal
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text("Sl.No", 35, tableTop + 10);
    doc.text("Product Name", 75, tableTop + 10);
    doc.text("Size / Color", 250, tableTop + 10);
    doc.text("Quantity", 360, tableTop + 10, { width: 50, align: 'center' });
    doc.text("Price", 420, tableTop + 10, { width: 60, align: 'right' });
    doc.text("Subtotal", 490, tableTop + 10, { width: 60, align: 'right' });

    doc.moveTo(30, tableTop + 30).lineTo(565, tableTop + 30).stroke(); // Header line

    // Columns
    doc.moveTo(70, tableTop).lineTo(70, tableTop + 350).stroke(); // Sl No -> Product
    doc.moveTo(240, tableTop).lineTo(240, tableTop + 350).stroke(); // Product -> Size
    doc.moveTo(360, tableTop).lineTo(360, tableTop + 350).stroke(); // Size -> Qty
    doc.moveTo(420, tableTop).lineTo(420, tableTop + 350).stroke(); // Qty -> Price
    doc.moveTo(490, tableTop).lineTo(490, tableTop + 350).stroke(); // Price -> Subtotal

    // Rows
    let y = tableTop + 40;
    let totalQty = 0;
    doc.font('Helvetica');
    sale.items.forEach((item, i) => {
      doc.text(i + 1, 35, y, { width: 30, align: 'center' });
      doc.font('Helvetica-Bold').text(item.clothId?.name || "Item", 75, y);
      
      const sizeColor = `${item.clothId?.size || '-'} / ${item.clothId?.color || '-'}`;
      doc.font('Helvetica').text(sizeColor, 250, y);
      
      doc.text(item.quantity, 360, y, { width: 50, align: 'center' });
      doc.text(item.price.toFixed(2), 420, y, { width: 60, align: 'right' });
      doc.text((item.price * item.quantity).toFixed(2), 490, y, { width: 60, align: 'right' });
      
      totalQty += item.quantity;
      y += 25;
      
      // Horizontal cell line
      doc.moveTo(30, y - 5).lineTo(565, y - 5).stroke();
    });

    // Total Row (at bottom of table)
    doc.rect(240, tableTop + 320, 325, 30).stroke();
    doc.font('Helvetica-Bold').text("TOTAL", 300, tableTop + 330);
    
    // Extracted Footers
    doc.fontSize(10).text(totalQty, 360, tableTop + 330, { width: 50, align: 'center' });
    doc.text(`₹ ${sale.totalAmount.toLocaleString()}`, 490, tableTop + 330, { width: 60, align: 'right' });

    // --- FOOTER SECTION ---
    const footerTop = 550;
    
    // Amount in Words Converter
    const convertNumberToWords = (amount) => {
        if (amount === 0) return "Zero Only";
        const a = ['','One ','Two ','Three ','Four ','Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        const b = ['','','Twenty ','Thirty ','Forty ','Fifty ','Sixty ','Seventy ','Eighty ','Ninety '];
        const num = Math.floor(amount).toString();
        if (num.length > 9) return 'overflow';
        const n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return ''; 
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + a[n[5][1]]) : '';
        return str.trim() + " Only";
    };

    doc.fontSize(10).font('Helvetica-Bold').text('Rupees in Words :', 30, tableTop + 360);
    doc.font('Helvetica-Oblique').text(convertNumberToWords(sale.totalAmount), 125, tableTop + 360, { width: 440 });

    const paymentMethod = sale.paymentId ? sale.paymentId.method : sale.paymentStatus;
    doc.font('Helvetica-Bold').text(`Payment Mode  : `, 30, footerTop);
    doc.font('Helvetica').text(paymentMethod, 120, footerTop);
    
    const staffName = sale.soldBy ? sale.soldBy.name : "Admin";
    doc.font('Helvetica-Bold').text(`Billed By            : `, 30, footerTop + 20);
    doc.font('Helvetica-Bold').text(staffName.toUpperCase(), 120, footerTop + 20);

    doc.font('Helvetica').text("Receiver's Signature", 30, footerTop + 90);
    
    // Owner Signature Block mimics the uploaded user image
    doc.font('Helvetica-Bold').fontSize(14).text("For Selvalakshmi Garments", 350, footerTop + 20);
    
    // Simulating cursive realistic signature using Times-Italic with dark blue generic ink
    const sigSetting = await Settings.findOne({ key: "STORE_SIGNATURE" });
    let sigDrawn = false;
    if (sigSetting && sigSetting.value) {
        // value is like "/uploads/signature_123.jpg"
        const sigPath = path.join(__dirname, "..", sigSetting.value);
        if (fs.existsSync(sigPath)) {
            doc.image(sigPath, 380, footerTop + 35, { fit: [140, 50] });
            sigDrawn = true;
        }
    }

    if (!sigDrawn) {
        doc.font('Times-Italic')
           .fillColor('#1e3a8a')
           .fontSize(38)
           .text("Selvalakshmi", 380, footerTop + 40);
    }
       
    doc.fillColor('black')
       .font('Helvetica-Bold')
       .fontSize(11)
       .text("Proprietor", 470, footerTop + 90);

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================
   GET SINGLE SALE (JSON)
   ====================== */
router.get("/:id", async (req, res) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { salesId: req.params.id };

    const sale = await Sale.findOne(query)
      .populate("items.clothId")
      .populate("soldBy");
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    
    // Compute remaining days and expiry strictly on the backend
    const saleDate = new Date(sale.date);
    const expiryDate = new Date(saleDate.getTime() + 10 * 24 * 60 * 60 * 1000); // +10 days
    const isExpired = new Date() > expiryDate;

    // Send the sale with attached return eligibility data
    res.json({
      ...sale.toObject(),
      returnEligibility: {
        isExpired,
        expiryDate: expiryDate.toISOString()
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
