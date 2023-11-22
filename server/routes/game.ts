import { Request, Response } from 'express';
import { addGameToDatabase, doesGameExist, getAllGamesByPlayer, getGameWithID } from '../database/game/game-service';
import { SerializedGame } from '../../shared/models/serialized-game';
import { GameHistoryGame } from '../../shared/models/game-history-game';
import { GlobalStats } from '../database/global-stats/global-stats-schema';
import { getCounts, incrementCounts } from '../database/global-stats/global-stats-service';
import { addGameToLeaderboard } from '../database/leaderboard/leaderboard-service';

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

    // increment global state counts
    const increment: GlobalStats = {
        placementCount: game.placements.length,
        gameCount: 1,
        puzzleCount: 0
    };
    await incrementCounts(increment);
    console.log("Placements:", game.placements.length);
    console.log("Incremented global stats to ", await getCounts());

    // if eligible for leaderboard, check if leaderboard-worthy
    addGameToLeaderboard(game, userID);

    res.status(200).send({success: true});

}

export async function getGameRoute(req: Request, res: Response) {

    const gameID = req.query['id'] as string;
    console.log("Recieved request for game:", gameID);

    const game = await getGameWithID(gameID);

    if (!game) {
        console.error("Game does not exist:", gameID);
        res.status(404).send({error : "Game does not exist"});
        return;
    }

    res.status(200).send(game);

}

export async function getGamesByPlayerRoute(req: Request, res: Response) {

    console.log("Session state:", req.session?.state);
    const userID = req.session?.state?.discordID;

    if (!userID) {
        res.status(401).send({"error": "Not logged in"});
        return;
    }

    // TODO: poll leaderboards for rank

    const dbGames = await getAllGamesByPlayer(userID);
    const games: GameHistoryGame[] = dbGames.map(dbGame => ({
            timestamp: dbGame.ts.toISOString(),
            gameID: dbGame.gid,
            startLevel: dbGame.sl,
            score19: dbGame.s19,
            score29: dbGame.s29,
            finalScore: dbGame.fs,
            finalLevel: dbGame.fle,
            overallAccuracy: dbGame.aAll,
            accuracy18: dbGame.a18,
            accuracy19: dbGame.a19,
            droughtPercent: dbGame.dro,
            tetrisReadiness: dbGame.tre,
            iPieceEfficiency: dbGame.ipe,
            leaderboardRank: undefined
        })
    );

    res.status(200).send(games);

}