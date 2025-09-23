const express = require('express');
const router = express.Router();
const { matchModel, chatModel } = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');


router.get('/matches', verifyToken, async (req, res) => {
    try {
        
      const today = new Date();
today.setHours(0, 0, 0, 0); // Start of today


// Delete expired matches (past dates)
await matchModel.deleteMany({ date: { $lt: today } });
        
        // Find matches from today onwards
        const matches = await matchModel.find({ 
            date: { $gte: today } 
        }).sort({ date: 1, time: 1 }); // Sort by date and time
        
        
        res.status(200).json(matches);
    } catch (error) {
        console.error('GET Error:', error); // Better error logging
        res.status(500).json({ error: "Server Error while fetching matches" });
    }
});

router.get('/matches/:id', verifyToken, async(req, res) => {
    try {
        const match = await matchModel.findById(req.params.id);
        if (!match) {
            return res.status(404).json({ error: "No match found" });
        }
        res.status(200).json(match);
    } catch (error) {
        res.status(500).json({ error: "No match listed" });
    }
});


// Exit a match
router.post('/exitMatch/:Matchid', verifyToken, async (req, res) => {
    try {
        const { Matchid } = req.params;
        const { playerName } = req.body;

        if (!playerName) {
            return res.status(400).json({ error: "Player name is required." });
        }

        const match = await matchModel.findById(Matchid);
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }

        // Remove player from match
        match.players = match.players.filter(p => p !== playerName);
        await match.save();

        res.status(200).json({ message: "Player removed from match successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while exiting match" });
    }
});

router.post('/joinMatch/:Matchid', verifyToken, async(req, res) => {
    try {
        const {Matchid} = req.params;
        const {playerName} = req.body;

        if (!playerName) {
            return res.status(400).json({error: "Player name is required."});
        }
        
        const match = await matchModel.findById(Matchid);
        if (!match) {
            return res.status(404).json({ error: "Match not found" });
        }
        match.players.push(playerName);
        await match.save();

        res.status(200).json({ message: "Player added to match successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server Error while joining match" });
        console.log(error);
    }
});

router.post("/find-players", verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    let chatMessage = new chatModel({
      message,
      sender: req.user.userId, // from verifyToken
    });

    await chatMessage.save();

    // 🔑 Populate before returning
    chatMessage = await chatMessage.populate("sender", "name username image_url");

    res.status(200).json(chatMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server Error while sending message" });
  }
});



router.get('/find-players', verifyToken, async (req, res) => {
  try {
    const messages = await chatModel.find()
      .populate("sender", "name username image_url")
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: "Server Error while fetching messages" });
    console.log(error);
  }
});


module.exports = router;

