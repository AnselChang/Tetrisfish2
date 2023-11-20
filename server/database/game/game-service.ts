import { SerializedGame } from "shared/models/serialized-game";
import DBGame from "./game-schema";

export async function addGameToDatabase(discordID: string, game: SerializedGame) {

    const dbGame = new DBGame({
        ts: new Date(),
        uid: discordID,
        gid: game.gameID,
        pm: game.placements,

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

        adj: game.numMissedAdjustments,
        aAll: game.overallAccuracy,
        a18: game.accuracy18,
        a19: game.accuracy19,
        a29: game.accuracy29,
        aI: game.accuracyI,
        aJ: game.accuracyJ,
        aL: game.accuracyL,
        aO: game.accuracyO,
        aS: game.accuracyS,
        aT: game.accuracyT,
        aZ: game.accuracyZ,
    });

    await dbGame.save();

}

// check if game exists in DBGame database
export async function doesGameExist(gameID: string): Promise<boolean> {
    const game = await DBGame.findOne({gid: gameID});
    return game !== null;
}