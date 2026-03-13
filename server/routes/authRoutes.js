
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const express = require("express");
const router = express.Router();

/* =========================
   REGISTER (Admin / Staff)
   ========================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user
    const userCount = await User.countDocuments();

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "staff",
      status: userCount === 0 ? "approved" : "active" 
    });

    await user.save();

    if (user.status === "pending") {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        "New Registration Request",
        `A new user has registered and is awaiting your approval:
        
Name: ${name}
Email: ${email}
Phone: ${phone}
Requested Role: ${user.role}

Please log in to the Admin Dashboard to review this request.`
      );
    }

    const message = user.status === "approved" 
      ? "First Admin account created and approved successfully." 
      : "Registration submitted. Awaiting Admin approval.";
    
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: DELETE USER
   ========================= */
router.delete("/users/:id", protect, admin, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (String(req.user.id) === String(targetId)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(targetId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const Sale = require("../models/Sale");
    const saleCount = await Sale.countDocuments({ soldBy: targetId });
    if (saleCount > 0) {
      return res.status(400).json({ message: "Cannot delete staff with existing sales records. Deactivate them instead." });
    }

    await User.findByIdAndDelete(targetId);

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: LIST USERS
   ========================= */
router.get("/users", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: UPDATE USER ROLE
   ========================= */
router.put("/users/:id/role", protect, admin, async (req, res) => {
  try {
    const { role } = req.body; // 'admin' | 'staff'
    if (!['admin','staff'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: ACTIVATE/DEACTIVATE USER
   ========================= */
router.put("/users/:id/status", protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const update = { status };
    if (status === "inactive" || status === "deactivated") {
      update.exitDate = Date.now();
    } else {
      update.exitDate = null;
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/users/:id/deactivate", protect, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { status: "inactive", exitDate: Date.now() }, 
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: "Staff deactivated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: UPDATE USER PROFILE (name/phone)
   ========================= */
router.put("/users/:id", protect, admin, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, phone }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: CREATE STAFF USER
   ========================= */
router.post("/users", protect, admin, async (req, res) => {
  try {
    const { name, email, password, phone, role = 'staff' } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, password: hashedPassword, role, status: 'approved' });
    await user.save();
    res.status(201).json({ message: 'User created', id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   LOGIN
   ========================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check status (Admins bypass approval)
    if (user.role !== "admin") {
      if (user.status === "pending") {
        return res.status(403).json({ message: "Your account is awaiting admin approval." });
      }
      if (user.status === "rejected") {
        return res.status(403).json({ message: "Your registration request was rejected." });
      }
      if (user.status === "inactive" || user.status === "deactivated") {
        return res.status(403).json({ message: "Your account has been deactivated. Contact admin." });
      }
    }

    // 2FA Check
    if (user.twoFactorEnabled) {
      // Generate a temporary 2FA token or code
      const tempToken = jwt.sign(
        { id: user._id, role: user.role, is2FA: true },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      // In a real app, sendEmail(user.email, "Your 2FA Code", "123456")
      console.log(`[2FA DEBUG] Code for ${user.email}: 123456`);
      
      return res.json({
        require2FA: true,
        tempToken,
        message: "Please enter the 2FA code sent to your email (Demo: 123456)"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };


    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   VERIFY 2FA
   ========================= */
router.post("/verify-2fa", async (req, res) => {
  try {
    const { tempToken, code } = req.body;
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.is2FA) return res.status(401).json({ message: "Invalid token type" });

    if (code !== "123456") {
      return res.status(401).json({ message: "Invalid 2FA code" });
    }

    const user = await User.findById(decoded.id);
    const finalToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token: finalToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(401).json({ message: "2FA session expired or invalid" });
  }
});

/* =========================
   TOGGLE 2FA
   ========================= */
router.put("/toggle-2fa", protect, async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.twoFactorEnabled = enabled;
    await user.save();

    res.json({ message: `2FA ${enabled ? 'enabled' : 'disabled'} successfully`, twoFactorEnabled: user.twoFactorEnabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: REVIEW PENDING USERS
   ========================= */
router.get("/pending", protect, admin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" }).select("-password");
    res.json(pendingUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   ADMIN: APPROVE/REJECT USER
   ========================= */
router.put("/approve/:id", protect, admin, async (req, res) => {
  try {
    const { status } = req.body; // "approved" or "rejected"
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = status;
    await user.save();

    // Send Email Notification to Staff
    const subject = status === "approved" ? "Admin Approved You" : "Registration Rejected";
    const text = status === "approved" 
      ? `Hello ${user.name},\n\nAdmin approved you. You can now login using your credentials.`
      : `Hello ${user.name},\n\nYour registration request was unfortunately rejected by the administrator.`;

    await sendEmail(user.email, subject, text);

    res.json({ message: `User ${status} successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
