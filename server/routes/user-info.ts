import { Request, Response } from 'express';
import { getUserSettings, setUserSettings } from '../database/user/user-service';
import { UserInfo } from 'shared/models/user-info';
import { UserSettings } from 'shared/models/user-settings';

// returns the username for the active session. Does not require database lookup
export async function usernameRoute(req: Request, res: Response) {

    console.log("Session state:", req.session?.state);
    const state = req.session?.state;

    if (!state) {
        res.status(401).send({"error": "Not logged in"});
        return;
    }

    const userInfo: UserInfo = {
        userID: state.discordID,
        username: state.username,
        isProUser: state.isProUser
    };

    res.send(userInfo);

}

export async function setUserSettingsRoute(req: Request, res: Response) {

    const userSettings = req.body as UserSettings;
    console.log("Recieved user settings:", userSettings);

    setUserSettings(userSettings);

    res.send({"success": true});
}


export async function getUserSettingsRoute(req: Request, res: Response) {

    const userID = req.query['userID'] as string;

    const settings = await getUserSettings(userID);
    console.log("Sending user settings:", settings);

    res.status(200).send(settings);
}
