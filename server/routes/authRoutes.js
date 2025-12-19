const express = require("express");
const router = express.Router();
const { userModel } = require("../models/User");
const { playerModel } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Validate fields
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user already exists (by email or username)
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? "Email already registered"
          : "Username already taken",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new userModel({
      name,
      email,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // 🔹 Automatically register the user as a player
    const existingPlayer = await playerModel.findOne({ $or: [{ email }, { username }] });
    if (!existingPlayer) {
      const newPlayer = new playerModel({
        name,
        email,
        username,
      });
      await newPlayer.save();
    }

    res.status(201).json({
      success: true,
      message: "User registered and added as player successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Get current user data
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user data" });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email/Username and password are required" });
    }

    // Check if identifier looks like an email
    const isEmail = /\S+@\S+\.\S+/.test(identifier);

    // Find user by email OR username
    const user = await userModel.findOne(
      isEmail ? { email: identifier } : { username: identifier }
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email/username or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email/username or password" });
    }

    // Generate JWT token with consistent userId field
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        name: user.name, email: user.email, username: user.username, isAdmin:user.isAdmin }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Get user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { name, email, username } = req.body;

    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.params.id,
        { name, email, username },
        { new: true }
      )
      .select("-password");

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Update password
router.put("/update-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "Current password and new password are required" 
      });
    }

    // Get user
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await userModel.findByIdAndUpdate(req.userId, {
      password: hashedNewPassword
    });

    res.json({ 
      success: true, 
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Get login audits
router.get("/login-audits", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Return mock data for now - in a real implementation, this would come from a database
    const mockAudits = [
      {
        _id: "1",
        loginTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        ipAddress: req.ip || "192.168.1.1",
        device: "Chrome on Windows",
        browser: "Chrome",
        location: "New York, USA",
        status: "success",
        userAgent: req.get("User-Agent")
      },
      {
        _id: "2",
        loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        ipAddress: "192.168.1.2",
        device: "Safari on iPhone",
        browser: "Safari",
        location: "Los Angeles, USA",
        status: "success",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
      },
      {
        _id: "3",
        loginTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        ipAddress: "192.168.1.3",
        device: "Firefox on Windows",
        browser: "Firefox",
        status: "failed",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0"
      }
    ];

    res.json({ 
      success: true, 
      audits: mockAudits 
    });
  } catch (error) {
    console.error("Login audits error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;
