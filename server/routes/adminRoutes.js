const express = require('express');
const router = express.Router();
const {userModel} = require('../models/User');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyToken = require('../middlewares/verifyToken');
const {matchModel} = require('../models/User');
const bcrypt = require('bcrypt');

// Admin registration

router.post('/newAdmin', async(req, res) => {
    const { username, password } = req.body;

    try{
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new userModel({username, password: hashedPassword, isAdmin:true});
        await admin.save();
        res.status(201).json({message:"Admin created successfully"});
    } catch(error){
        res.status(500).json({error: "Error creating Admin"});
    }
});

router.post('/addMatch', verifyAdmin, async(req, res) => {
    try{
        const { sport, venue, time} = req.body; 
        if(!sport || !venue || !time){
            return res.status(401).json({error: "All fields req.."});
        }
        const newMatch = new matchModel({sport, venue, time});
        await newMatch.save();
        res.status(200).json({message:"Match Listed Successfully"});
    } catch(error){
        res.status(500).json({error: "Server Error!"})
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

module.exports = router;

