import { Request, Response } from 'express';
import { addGameToDatabase } from 'server/database/game/game-service';
import { SerializedGame } from 'shared/models/serialized-game';

export async function sendGameRoute(req: Request, res: Response) {

    console.log("Session state:", req.session?.state);
    const userID = req.session?.state?.discordID;

    if (!userID) {
        res.status(401).send({"error": "Not logged in"});
        return;
    }

    const game = req.body as SerializedGame;
    console.log("Recieved game from user:", userID, game);

    // add the game to the database
    await addGameToDatabase(userID, game);

    res.send({});

}