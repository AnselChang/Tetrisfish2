import mongoose from "mongoose";
import DBUser, { User } from "./user-schema";

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

export async function getUserByID(discordID: string): Promise<User | undefined> {
    const user = await DBUser.findOne({discordID: discordID});

    if (!user) {
        return undefined;
    }

    return {
        discordID: user.discordID,
        username: user.username,
        isProUser: user.isProUser,
        playstyle: user.playstyle,
    };
}