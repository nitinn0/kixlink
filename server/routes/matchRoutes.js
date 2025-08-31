const express = require('express');
const router = express.Router();
const { matchModel, chatModel } = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

router.get('/matches', verifyToken, async (req, res) => {
    try {
        const matches = await matchModel.find({ date: { $gte: new Date() } });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ error: "Server Error while fetching matches" });
        console.log(error);
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

router.post('/joinMatch/:Matchid/:venue', verifyToken, async(req, res) => {
    try {
        const {Matchid, venue} = req.params;
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

router.post('/find-players', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;
        
        const chatMessage = new chatModel({
            message,
            sender: req.user.userId,
            timestamp: new Date()
        });
        await chatMessage.save();      
        res.status(200).json({ message: "Message sent successfully"});
    } catch (error) {
        res.status(500).json({ error: "Server Error while sending message" });
    }
});

router.get('/find-players', verifyToken, async (req, res) => {
    try {
        const messages = await chatModel.find().sort({ timestamp: -1 }).limit(100); 
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Server Error while fetching messages" });
        console.log(error);
    }
});

module.exports = router;

