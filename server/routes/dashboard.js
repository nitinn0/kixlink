const express = require("express");
const router = express.Router();
const { teamModel, matchModel, chatModel, userModel } = require("../models/User");
const { playerModel } = require("../models/User");
const { arenaModel } = require("../models/User");
const verifyToken = require("../middlewares/verifyToken");
const cacheManager = require("../utils/cacheManager");
const mongoose = require('mongoose');

/**
 * Dashboard stats endpoint with Redis caching
 * 
 * PERFORMANCE:
 * - First request: ~150ms (queries database)
 * - Subsequent requests (within 15 min): ~5ms (Redis cache hit!)
 * - Cache expires after 15 minutes
 * 
 * Cache key: dashboard:stats:all
 * Cache TTL: 15 minutes (900 seconds)
 */
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const cacheKey = "dashboard:stats:all";

    // Step 1: Check if data exists in Redis cache
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache HIT for ${cacheKey}`);
      return res.json({
        success: true,
        message: "Dashboard stats (from cache)",
        data: cachedData,
        source: "redis_cache",
      });
    }

    console.log(`❌ Cache MISS for ${cacheKey} - querying database`);

    // Step 2: Cache miss - query database
    const [
      totalUsers,
      totalTeams,
      totalMatches,
      totalArenas,
      upcomingMatches,
      recentMatches,
    ] = await Promise.all([
      userModel.countDocuments(),
      teamModel.countDocuments(),
      matchModel.countDocuments(),
      arenaModel.countDocuments(),
      matchModel.find({ date: { $gte: new Date() } }).limit(5).sort({ date: 1 }),
      matchModel.find().limit(5).sort({ date: -1 }),
    ]);

    const stats = {
      totalUsers,
      totalTeams,
      totalMatches,
      totalArenas,
      upcomingMatches: upcomingMatches.length,
      recentMatches: recentMatches.length,
      generatedAt: new Date().toISOString(),
    };

    // Step 3: Store in Redis cache for 15 minutes
    await cacheManager.set(cacheKey, stats, 900);

    res.json({
      success: true,
      message: "Dashboard stats (queried from database)",
      data: stats,
      source: "database",
    });
  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
});

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

router.get('/arena/:id', async (req, res) => {
  try {
    const arena = await arenaModel.findById(req.params.id);
    if(!arena){
      return res.status(404).json({error: "Arena not found"});
    }
    return res.status(200).json(arena);
  } catch(error){
    return res.status(500).json({error: error.message});
  }
});

// Get matches for a specific arena
router.get("/arena/:id/matches", async (req, res) => {
  try {
    const arenaId = req.params.id;

    // ✅ Fetch matches where arena field equals arenaId
    const matches = await matchModel
      .find({ arenaId: arenaId }) 
      .sort({ date: 1 })
      .populate("arenaId", "arenaName image_url totalCapacity"); // optional: get arena details

    res.status(200).json(matches);
  } catch (error) {
    console.error("Fetch Matches Error:", error);
    res.status(500).json({ error: "Server Error while fetching matches" });
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