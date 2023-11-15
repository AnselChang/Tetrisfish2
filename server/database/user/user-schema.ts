import mongoose, { Schema } from "mongoose";

const speedAccuracySchema = new Schema({
    speed: Number,
    accuracy: Number,
    count: Number,
});

const pieceAccuracySchema = new Schema({
    piece: String,
    accuracy: Number,
    count: Number,
});


const gameSchema = new Schema({
    timestamp: Date,
    gameData: String,
    title: String,
    inputSpeed: Number,
    startLevel: Number,
    endScore: Number,
    endLevel: Number,
    endLines: Number,
    overallAccuracy: Number, // does not include 29+ accuracy, except at 29+ start
    speedAccuracy: [speedAccuracySchema],
    pieceAccuracy: [pieceAccuracySchema],
});

// Schema for a tetrisfish user
const userSchema = new Schema({
    discordID: String,
    displayName: String,
    isProUser: Boolean,
    playstyle: String,
    games: [gameSchema],
});

const DBUser = mongoose.model('DBUser', userSchema);
export default DBUser;