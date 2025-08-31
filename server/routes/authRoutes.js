const express = require('express');
const router = express.Router();
const { userModel } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// User Registration

router.post('/register', async(req, res) => {
    try{
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({username, password: hashedPassword});
        await user.save();
        res.status(200).json({message: 'User registered successfully'});
    } catch(error){
        res.status(500).json({error: "Registration failed", error});
        console.log(error);
    }
});

// User/Admin Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Authentication failed!" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Authentication failed" });
        }
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin }, 
            "my-key", 
            { expiresIn: "1h" }
        );

        res.status(200).json({
            token,
            message: user.isAdmin ? "Admin logged in" : "User logged in",
        });

    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});
module.exports = router;