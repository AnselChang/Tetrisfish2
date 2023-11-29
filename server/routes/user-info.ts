import { Request, Response } from 'express';
import { UserInfo } from 'shared/models/user-info';

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