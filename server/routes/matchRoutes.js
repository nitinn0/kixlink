const express = require('express');
const router = express.Router();
const { matchModel, chatModel } = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

// ------------------- MATCH ROUTES -------------------

// ✅ Get all upcoming matches
router.get('/matches', verifyToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete expired matches
    await matchModel.deleteMany({ date: { $lt: today } });

    // Fetch upcoming matches
    const matches = await matchModel
      .find({ date: { $gte: today } })
      .sort({ date: 1, time: 1 })
      .populate("arenaId", "arenaName image_url totalCapacity")
      .populate("teams", "teamName players totalMembers");

    res.status(200).json(matches);
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: 'Server Error while fetching matches' });
  }
});


// ✅ Get match by ID
router.get('/matches/:id', verifyToken, async (req, res) => {
  try {
    const match = await matchModel.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'No match found' });
    }
    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({ error: 'No match listed' });
  }
});

// ✅ Exit a match
router.post('/exitMatch/:Matchid', verifyToken, async (req, res) => {
  try {
    const { Matchid } = req.params;
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required.' });
    }

    const match = await matchModel.findById(Matchid);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.players = match.players.filter((p) => p !== playerName);
    await match.save();

    res.status(200).json({ message: 'Player removed from match successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while exiting match' });
  }
});

// ✅ Join a match
router.post('/joinMatch/:Matchid', verifyToken, async (req, res) => {
  try {
    const { Matchid } = req.params;
    const { playerName } = req.body;

    if (!playerName) {
      return res.status(400).json({ error: 'Player name is required.' });
    }

    const match = await matchModel.findById(Matchid);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    match.players.push(playerName);
    await match.save();

    res.status(200).json({ message: 'Player added to match successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Server Error while joining match' });
  }
});


module.exports = router;
