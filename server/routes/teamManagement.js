const express = require('express');
const router = express.Router();
const {teamModel} = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

router.post('/create-team', verifyToken, async(req, res) => {
    const {teamName} = req.body;
    try{
        if(!teamName){
            res.status(400).json({error:"Input team name"});
        }
        const existingTeam = await teamModel.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({ error: "Team name already exists" });
        }
        const newTeam = new teamModel({teamName});
        await newTeam.save();
    } catch(error){
        res.status(500).json({error:"error"})
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