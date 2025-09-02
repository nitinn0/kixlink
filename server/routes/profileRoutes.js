const express = require('express');
const router = express.Router();
const { userModel } = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: 'Server Error' });
    }
})

module.exports = router;