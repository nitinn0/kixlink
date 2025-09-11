const express = require("express");
const router = express.Router();
const { userModel } = require("../models/User");
const { playerModel } = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    // Generate JWT token
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { name: user.name, email: user.email, username: user.username, isAdmin:user.isAdmin }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

module.exports = router;
