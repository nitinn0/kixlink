const express = require('express');
const router = express.Router();
const {teamModel} = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');
router.post('/addTeam', verifyAdmin, async (req, res) => {
  try {
    const { teamName, players = [] } = req.body; // default players to []

    if (!teamName || typeof teamName !== "string") {
      return res.status(400).json({ error: "Team name is required." });
    }

    const newTeam = {
      teamName: teamName.trim(),
      players: Array.isArray(players) ? players.map((p) => p.trim()) : [],
    };

    const team = new teamModel(newTeam);
    await team.save();

    res.status(201).json({ message: "Team added successfully", team });
  } catch (error) {
    console.error("Add Team Error:", error);
    res.status(500).json({ error: "Server Error while adding team" });
  }
});


router.get('/teams', verifyToken, async(req, res) => {
    try {
        const teams = await teamModel.find();
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ error: "Server Error while fetching teams" });
        console.log(error);
    }
});

router.get('/teams/:id', verifyToken, async(req, res) => {
    try {
        const team = await teamModel.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: "Team doesn't exist" });
        }
        res.status(200).json(team);
    } catch (error) {
        res.status(500).json({ error: "Server error!" });
    }
});

router.post('/teams/:id/members', verifyToken, async(req, res) => {
    const { player } = req.body;
    if (!player) {
        return res.status(400).json({ error: "Player name is required." });
    }
    const team = await teamModel.findById(req.params.id);
    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }
    team.players.push(player);
    await team.save();
    res.status(200).json({ message: "Player added to team successfully" });
});

router.get('/teams/:id/members', verifyToken, async(req, res) => {
    try {
        const team = await teamModel.findById(req.params.id);
        if (!team) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json({ players: team.players.length > 0 ? team.players : "No players found!" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;