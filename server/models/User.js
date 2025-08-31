const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: {type: String, required:true, unique: true},
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

const userModel = mongoose.model('User', userSchema);
const matchModel = mongoose.model('Match', matchSchema);
const chatModel = mongoose.model("Chat", chatSchema);
const teamModel = mongoose.model("Team", teamSchema);

const db = "mongodb+srv://nitinkapoor117:PRAJWa67IbBncLHG@test-db.rwlyl.mongodb.net/kixlink-db"

mongoose.connect(db).then(() => console.log("DB connected")).catch((err)=> console.log(err));

module.exports = {userModel, matchModel, chatModel, teamModel};