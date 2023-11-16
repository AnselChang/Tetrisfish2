import mongoose from "mongoose";
import DBUser from "./user-schema";

export async function createNewUser(discordID: string, username: string): Promise<mongoose.Types.ObjectId> {

    const user = new DBUser({
        discordID: discordID,
        username: username,
        isProUser: false,
        playstyle: "unknown",
        games: []
    });

    console.log("Created new user:", user);
    await user.save();
    return user._id;
}

export async function doesUserExist(discordID: string): Promise<boolean> {
    const user = await DBUser.findOne({discordID: discordID});
    return user !== null;
}