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
        required: true,
    }
});

const DBUser = mongoose.model('DBUser', userSchema);
export default DBUser;