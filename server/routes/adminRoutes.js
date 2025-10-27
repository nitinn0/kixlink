const express = require('express');
const router = express.Router();
const {userModel, arenaModel} = require('../models/User');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyToken = require('../middlewares/verifyToken');
const {matchModel, teamModel} = require('../models/User');
const bcrypt = require('bcrypt');

// Admin registration

router.post('/newAdmin', async(req, res) => {
    const { name, email, username, password } = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new userModel({name, email, username, password: hashedPassword, isAdmin:true});
        await admin.save();
        res.status(201).json({message:"Admin created successfully"});
    } catch(error){
        res.status(500).json({error: error.message});
    }
});

// adminRoutes.js
router.post('/addMatch', verifyAdmin, async (req, res) => {
  try {
    const { venue, date, time, arenaId } = req.body;

    if (!venue || !date || !time || !arenaId) {
      return res.status(400).json({ error: "All fields required: venue, date, time, arenaId" });
    }

    // Combine date + time into a single Date object
    const [hours, minutes] = time.split(":").map(Number);
    const matchDate = new Date(date);
    matchDate.setHours(hours, minutes, 0, 0);

    // Calculate slot start (round to hour)
    const slotStart = new Date(date);
    slotStart.setHours(hours, 0, 0, 0);

    const today = new Date();
    if (matchDate < today) {
      return res.status(400).json({ error: "Cannot create match for past dates/times" });
    }

    // Check for duplicate in same 1-hour slot
    const duplicate = await matchModel.findOne({
      arenaId,
      slotStart
    });

    if (duplicate) {
      return res.status(400).json({ error: "A match is already scheduled in this time slot." });
    }

    const newMatch = new matchModel({
      arenaId,
      venue: venue.trim(),
      date: matchDate,
      time: time, // keep exact input time
      slotStart,
      players: []
    });

    await newMatch.save();
    res.status(201).json({ message: "Match Listed Successfully", match: newMatch });

  } catch (error) {
    console.error("Add Match Error:", error);

    // Handle unique index violation
    if (error.code === 11000) {
      return res.status(400).json({ error: "A match is already scheduled in this time slot." });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    res.status(500).json({ error: "Server Error while adding match" });
  }
});



router.post('/deleteMatch/:Matchid', verifyAdmin, async(req, res) =>{
    try{
        const {Matchid} = req.params;
        await matchModel.findByIdAndDelete(Matchid);
        res.status(200).json({message: "Match Deleted Successfully"});
    } catch(error){
        res.status(500).json({error: "Server Error!"});
        console.log(error);
    }
});

router.post('/createTeamForMatch/:matchId', verifyAdmin, async (req, res) => {
    try {
        const { matchId } = req.params;
        const { teamName, totalMembers } = req.body;

        if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
            return res.status(400).json({ error: "Team name is required" });
        }

        if (!totalMembers || totalMembers < 1) {
            return res.status(400).json({ error: "Total members must be at least 1" });
        }

        const match = await matchModel.findById(matchId);
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }

        // Create the team
        const newTeam = new teamModel({
            teamName: teamName.trim(),
            players: [],
            totalMembers: totalMembers
        });
        await newTeam.save();

        // Add to match teams
        if (!match.teams) match.teams = [];
        match.teams.push(newTeam._id);

        // Ensure slotStart is set
        if (!match.slotStart) {
            const [hours] = match.time.split(":").map(Number);
            match.slotStart = new Date(match.date);
            match.slotStart.setHours(hours, 0, 0, 0);
        }

        await match.save();

        res.status(201).json({ message: "Team created successfully", team: newTeam });
    } catch (error) {
        console.error("Create Team Error:", error);
        res.status(500).json({ error: "Server Error while creating team" });
    }
});

router.post('/addArena', verifyAdmin, async(req, res) => {
    try {
        const { arenaName, totalCapacity } = req.body;
        if(!arenaName){
            return res.status(401).json({message: "All fields required"});
        }
        const newArena = new arenaModel({ arenaName, totalCapacity});
        await newArena.save();
        res.status(200).json({message: "Arena Added Successfully"});
    } catch(error){
        res.status(500).json({error: error.message})
    }
})

module.exports = router;

