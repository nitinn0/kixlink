const express = require('express');
const router = express.Router();
const {userModel, arenaModel, teamModel} = require('../models/User');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyToken = require('../middlewares/verifyToken');
const {matchModel} = require('../models/User');
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

router.post('/addMatch', verifyAdmin, async(req, res) => {
    try{
        const { venue, time, date } = req.body; 
        
        if(!venue || !time || !date){
            return res.status(400).json({error: "All fields required: venue, time, and date"});
        }
        
        const matchDate = new Date(date);
        if (isNaN(matchDate.getTime())) {
            return res.status(400).json({ 
                error: "Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY" 
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (matchDate < today) {
            return res.status(400).json({ 
                error: "Cannot create match for past dates" 
            });
        }
        
        const newMatch = new matchModel({
            venue: venue.trim(), 
            time: time.trim(),
            date: matchDate,
            players: [] // Initialize empty players array
        });
        
        await newMatch.save();
        res.status(201).json({message: "Match Listed Successfully", match: newMatch});
        
    } catch(error){
        console.error('Add Match Error:', error);
        
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                error: "Validation Error", 
                details: errors 
            });
        }
        
        res.status(500).json({error: "Server Error while adding match"});
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


// PATCH /teams/:id/addPlayer
router.patch('/teams/:id/addPlayer', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { players } = req.body; // expecting array of player IDs or names

    if (!players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({ error: "At least one player is required." });
    }

    const team = await teamModel.findById(id);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Avoid duplicates
    const uniquePlayers = [
      ...new Set([...team.players, ...players.map((p) => p.trim())]),
    ];

    team.players = uniquePlayers;
    await team.save();

    res.status(200).json({ message: "Players added successfully", team });
  } catch (error) {
    console.error("Add Player Error:", error);
    res.status(500).json({ error: "Server Error while adding players" });
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

