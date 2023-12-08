import { SerializedGame, SerializedPlacement } from "shared/models/serialized-game";
import { GameFromDatabase } from "shared/models/game-from-database";
import DBGame from "./game-schema";
import { getUserByID } from "../user/user-service";

export async function addGameToDatabase(discordID: string, game: SerializedGame) {

    const dbGame = new DBGame({
        ts: new Date(),
        uid: discordID,
        gid: game.gameID,
        pm: game.placements,
        npm: game.placements.length,

        sl: game.startLevel,
        is: game.inputSpeed,
        ps: game.playstyle,
        lb: game.eligibleForLeaderboard,

        s19: game.scoreAtTransitionTo19,
        s29: game.scoreAtTransitionTo29,
        fs: game.finalScore,
        fle: game.finalLevel,
        fli: game.finalLines,

        trt: game.tetrisRate,
        dro: game.droughtPercent,
        tre: game.tetrisReadiness,
        ipe: game.iPieceEfficiency,

        aAll: game.overallAccuracy,
        a18: game.accuracy18,
        a19: game.accuracy19,
        a29: game.accuracy29,
    });

    await dbGame.save();

}

// check if game exists in DBGame database
export async function doesGameExist(gameID: string): Promise<boolean> {
    const game = await DBGame.findOne({gid: gameID});
    return game !== null;
}

export async function getGameWithID(gameID: string): Promise<GameFromDatabase | undefined> {
    const game = await DBGame.findOne({gid: gameID});

    if (!game) {
        return undefined;
    }

    const player = await getUserByID(game.uid);
    const playerName = player ? player.username : "unknown";

    return {
        timestamp: game.ts.toISOString(),
        discordID: game.uid,
        playerName: playerName,
        gameID: game.gid,
        placements: game.pm,
        startLevel: game.sl,
        inputSpeed: game.is,
        playstyle: game.ps,
    };
}

export async function getAllGamesByPlayer(discordID: string) {
    return await DBGame.find({uid: discordID});
}

export interface Serialized18Placements {
    numPlacements: number,
    placements: SerializedPlacement[],
}

// get the level 18 placements from 18 start games that last at least 300 placements from the entire database
export async function getPlacementsOn18(): Promise<Serialized18Placements> {

    const placements: SerializedPlacement[] = [];

    // get all 18 start games taht have at least 300 placements, and get the first 300 placements from those
    const games = await DBGame.aggregate([
        { 
            $match: { 
                sl: 18,
                npm: { $gt: 300 }
            }
        },
        {
            $project: {
                pm: { $slice: ["$pm", 300] }
            }
        }
    ]);

    // for each of those games, add the 300 placements to the list
    games.forEach(game => {
        if (Array.isArray(game.pm)) {
            placements.push(...game.pm);
        }
    });

    return {
        numPlacements: placements.length,
        placements: placements,
    }
}