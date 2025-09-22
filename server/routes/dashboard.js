const express = require("express");
const router = express.Router();
const { teamModel, matchModel } = require("../models/User");
const { playerModel } = require("../models/User");
const {arenaModel} = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    res.json({ success: true, message: "Dashboard data", user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
  }
});

router.get('/players', verifyToken, async(req, res) => {
    try {

     const players = await playerModel.find().sort({ createdAt: -1 });
     if (!players || players.length === 0) {
      return res.status(404).json({ message: "No players found!" });
    }
    res.status(200).json(players);
    } catch(error){
       return res.status(500).json({error : "Internal Server Error"})
    }
});

router.get('/arena', async (req, res) => {
  try {
    const arenas = await arenaModel.find().sort({ createdAt: -1 });

    if (!arenas || arenas.length === 0) {
      return res.status(404).json({ error: "No Arenas Found" });
    }

    return res.status(200).json(arenas);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.put("/users/update", async (req, res) => {
  console.log("📥 /users/update hit with body:", req.body);
  try {
    const { id, name, username, email } = req.body;
    const user = await userModel.findByIdAndUpdate(
      id,
      { name, username, email},
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;