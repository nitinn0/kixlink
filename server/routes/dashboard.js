const express = require("express");
const router = express.Router();
const { teamModel } = require("../models/User");
const { playerModel } = require("../models/User");
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

router.get('/arena', async(req, res) => {
  try{
  const arenaName = arenaModel.find().sort({createdAt: -1});
  if(!arenaName || arenaName.length === 0){
    return res.status(404).json({error: "No Arenas Found"})
  }
  return res.status(200).json(arenaName);
}catch(error){
  return res.status(500).json({error: error.message});
}
})
module.exports = router;