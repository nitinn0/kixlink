const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String, required:true},
    email: {type: String, required:true, unique: true},
    username: {type: String, required:true, unique: true, sparse: true},
    password: {type: String, required:true},
    isAdmin: {type:Boolean, default:false}
});

const matchSchema = new mongoose.Schema({
    sport: {type: String, required:true},
    venue: {type: String, required:true},
    time: {type: String, required:true},
    players: { type: [String], default: [] }
});

const chatSchema = new mongoose.Schema({
    message: { type:String, required:true },
    sender: { type: String, required:true},
    timestamp:{type: Date, default:Date.now}
});

const teamSchema = new mongoose.Schema({
    players: {type: [String], default:[]},
    teamName: {type: String, required:true, unique:true}
})

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
})

const userModel = mongoose.model('User', userSchema);
const matchModel = mongoose.model('Match', matchSchema);
const chatModel = mongoose.model("Chat", chatSchema);
const teamModel = mongoose.model("Team", teamSchema);
const playerModel = mongoose.model("Players", playerSchema);

module.exports = {userModel, matchModel, chatModel, teamModel, playerModel};