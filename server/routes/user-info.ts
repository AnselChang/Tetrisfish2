import { Request, Response } from 'express';

// returns the username for the active session. Does not require database lookup
export async function username(req: Request, res: Response) {

    console.log("Session state:", req.session?.state);
    const username = req.session?.state?.username;

    if (!username) {
        res.status(401).send({"error": "Not logged in"});
        return;
    }

    res.send({"username" : username});

}