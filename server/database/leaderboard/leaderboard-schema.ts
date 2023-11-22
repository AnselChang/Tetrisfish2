import mongoose, { Schema } from "mongoose";

export interface LeaderboardEntry {
    discordID: string,
    playerName: string,
    isProUser: boolean,
    ts: Date,
    inputSpeed: number,
    playstyle: string,
    tetrisReadiness: number,
    score: number,
    accuracy: number
}

const leaderboardEntrySchema = new Schema({
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
    ts: {
        type: Date,
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

// custom uuid-generated id, and json for the bug report
const leaderboardSchema = new Schema({
    type: {
        type: String,
        enum: ["Overall", "29 start"],
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