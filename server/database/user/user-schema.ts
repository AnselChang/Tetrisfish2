import mongoose, { Schema } from "mongoose";

export interface User {
    discordID: string,
    username: string,
    isProUser: boolean,
    playstyle: string,
}

// Schema for a tetrisfish user
const userSchema = new Schema({
    discordID: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    isProUser: {
        type: Boolean,
        required: true,
    },
    playstyle: {
        type: String,
        required: false,
    },
    inputSpeed: {
        type: Number,
        reuqired: false,
    }, minoThreshold: {
        type: Number,
        required: false,
    }, textThreshold: {
        type: Number,
        required: false,
    }
});

const DBUser = mongoose.model('DBUser', userSchema);
export default DBUser;