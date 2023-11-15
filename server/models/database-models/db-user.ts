import mongoose, { Schema } from "mongoose";

// Schema for a tetrisfish user
const userSchema = new Schema({
    discordID: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    isProUser: {
        type: Boolean,
        required: true,
    },
    

});

const DBUser = mongoose.model('DBUser', userSchema);
export default DBUser;