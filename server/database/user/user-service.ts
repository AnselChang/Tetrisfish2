import mongoose from "mongoose";
import DBUser, { User } from "./user-schema";
import { UserSettings } from "shared/models/user-settings";

export async function createNewUser(discordID: string, username: string): Promise<mongoose.Types.ObjectId> {

    const user = new DBUser({
        discordID: discordID,
        username: username,
        isProUser: false,
        playstyle: "unknown",
        inputSpeed: 30,
        minoThreshold: 5,
        textThreshold: 70
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
        playstyle: user.playstyle ?? "unknown",
    };
}


export async function setUserSettings(settings: UserSettings): Promise<void> {
    const user = await DBUser.findOne({discordID: settings.userID});
    if (!user) {
        return;
    }

    user.playstyle = settings.playstyle;
    user.inputSpeed = settings.inputSpeed;
    user.minoThreshold = settings.minoThreshold;
    user.textThreshold = settings.textThreshold;

    await user.save();
}


export async function getUserSettings(discordID: string): Promise<UserSettings | undefined> {
    const user = await DBUser.findOne({discordID: discordID});

    if (!user) {
        return undefined;
    }

    return {
        userID: user.discordID,
        playstyle: user.playstyle ?? undefined,
        inputSpeed: user.inputSpeed ?? undefined,
        minoThreshold: user.minoThreshold ?? undefined,
        textThreshold: user.textThreshold ?? undefined,
    };
}