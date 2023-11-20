import { Request, Response } from 'express';
import { addGameToDatabase, doesGameExist } from '../database/game/game-service';
import { SerializedGame } from '../../shared/models/serialized-game';

export async function sendGameRoute(req: Request, res: Response) {

    console.log("Session state:", req.session?.state);
    const userID = req.session?.state?.discordID;

    if (!userID) {
        res.status(401).send({"error": "Not logged in"});
        return;
    }

    const game = req.body as SerializedGame;
    console.log("Recieved game from user:", userID, game.gameID, game.finalScore);

    if (await doesGameExist(game.gameID)) {
        console.error("Game already exists:", game.gameID);
        res.status(409).send({error : "Game already exists"});
        return;
    }

    // add the game to the database
    await addGameToDatabase(userID, game);

    res.status(200).send({success: true});

}