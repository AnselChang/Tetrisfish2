import mongoose from "mongoose";
import DBUser, { User } from "./user-schema";
import { UserSettings } from "shared/models/user-settings";
import { updateIsProForUserInLeaderboards } from "../leaderboard/leaderboard-service";

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

export async function setProUserStatus(discordID: string, isProUser: boolean) {
    const user = await DBUser.findOne({discordID: discordID});
    if (!user) {
        console.log("setProUserStatus: User not found")
        return;
    }

    // check if user pro status is already set to the desired value. if so, do nothing
    if (user.isProUser === isProUser) {
        console.log("setProUserStatus: User already has desired pro status");
        return;
    }

    // Okay. there is a change in pro status. Update the database
    user.isProUser = isProUser;
    await user.save();

    // also update leaderboard cache to reflect this change
    await updateIsProForUserInLeaderboards(discordID, isProUser);

    console.log(`setProUserStatus: Set user ${discordID} pro status to ${isProUser} and updated leaderboards`);

}