import mongoose, { Schema } from "mongoose";

export interface LeaderboardEntry {
    gameID: string,
    discordID: string,
    playerName: string,
    isProUser: boolean,
    timestamp: Date,
    startLevel: number,
    inputSpeed: number,
    playstyle: string,
    tetrisReadiness: number,
    score: number,
    accuracy: number
}

const leaderboardEntrySchema = new Schema({
    gameID: {
        type: String,
        required: true,
    },
    discordID: {
        type: String,
        required: true,
    },
    playerName: {
        type: String,
        required: true,
    },
    isProUser: {
        type: Boolean,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
    },
    startLevel: {
        type: Number,
        required: true,
    },
    inputSpeed: {
        type: Number,
        required: true,
    },
    playstyle: {
        type: String,
        required: true,
    },
    tetrisReadiness: {
        type: Number,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
        index: true,
    }
});

export enum LeaderboardType {
    OVERALL = "Overall",
    START_29 = "29 start"
}

// custom uuid-generated id, and json for the bug report
const leaderboardSchema = new Schema({
    type: {
        type: String,
        enum: LeaderboardType,
        required: true,
    },
    lowestAccuracy: { // worst accuracy in the leaderboard to determine if a new entry should be added
        type: Number,
        required: true,
    },
    entries: [leaderboardEntrySchema],
});

const DBLeaderboard = mongoose.model('DBLeaderboard', leaderboardSchema);
export default DBLeaderboard;