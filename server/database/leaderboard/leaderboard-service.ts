import { SerializedGame } from "shared/models/serialized-game";
import DBLeaderboard, { LeaderboardEntry, LeaderboardType } from "./leaderboard-schema";
import { getUserByID } from "../user/user-service";

const MAX_LEADERBOARD_ENTRIES = 100;
const MAX_LEADERBOARD_ENTRIES_WITH_BUFFER = 110; // 10 extra entries to reduce chance of  race conditions

// if game is good enough for leaderboard, add it to the leaderboard and remove the worst game if full
export async function addGameToLeaderboard(game: SerializedGame, userID: string) {

    // check if game is eligible for leaderboard
    if (!game.eligibleForLeaderboard) {
        console.log("Game is not eligible for leaderboard");
        return;
    }

    let leaderboardType: LeaderboardType;
    if (game.startLevel === 18 || game.startLevel === 19) {
        leaderboardType = LeaderboardType.OVERALL;
    } else if (game.startLevel === 29) {
        leaderboardType = LeaderboardType.START_29;
    } else {
        console.log("Game is wrong level for leaderboard");
        return; // not eligible for leaderboard
    }

    // get the corresponding leaderboard
    let leaderboard = await DBLeaderboard.findOne({type: leaderboardType});

    // if leaderboard doesn't exist, create it
    if (!leaderboard) {
        leaderboard = new DBLeaderboard({
            type: leaderboardType,
            lowestAccuracy: 0,
            entries: [],
        });
        console.log("Created new leaderboard:", leaderboardType);
    }
    
    // check if game is better than the worst game in the leaderboard using leaderboard's lowestAccuracy cache
    if (game.overallAccuracy < leaderboard.lowestAccuracy) {
        console.log("Game is not better than the worst game in the leaderboard");
        return;
    }

    // get user info
    const user = await getUserByID(userID);

    if (!user) {
        console.error("User does not exist:", userID);
        return;
    }

    console.log("Adding game to leaderboard:", game.gameID, user.username);

    // add the game to the leaderboard
    leaderboard.entries.push({
        gameID: game.gameID,
        playerName: user.username,
        isProUser: user.isProUser,
        timestamp: (new Date()).toISOString(),
        startLevel: game.startLevel,
        inputSpeed: game.inputSpeed,
        playstyle: game.playstyle,
        tetrisReadiness: game.tetrisReadiness,
        score: game.finalScore,
        accuracy: game.overallAccuracy,
    });

    // if leaderboard is full, remove the worst game
    if (leaderboard.entries.length > MAX_LEADERBOARD_ENTRIES_WITH_BUFFER) {
        leaderboard.entries.sort((a, b) => a.accuracy - b.accuracy);
        leaderboard.entries.shift(); // remove the worst game
        console.log("Removed worst game from leaderboard:", leaderboardType);
    }

    // update the lowest accuracy cache
    leaderboard.lowestAccuracy = leaderboard.entries[0].accuracy;

    // save the leaderboard
    await leaderboard.save();

}

// get the full leaderboard given a type
// sort by accuracy. first entry is the best game
export async function getLeaderboard(leaderboardType: LeaderboardType): Promise<LeaderboardEntry[]> {

    const leaderboard = await DBLeaderboard.findOne({type: leaderboardType});

    if (!leaderboard) {
        return [];
    }

    // sort by accuracy
    leaderboard.entries.sort((a, b) => b.accuracy - a.accuracy);

    // convert to LeaderboardEntry[]
    const games: LeaderboardEntry[] = [];
    for (const entry of leaderboard.entries) {
        games.push(entry);
    }

    // trim past MAX_LEADERBOARD_ENTRIES
    games.splice(MAX_LEADERBOARD_ENTRIES);
    

    return games;
}

// get a list of all the accuracies sorted from best to worst for a given leaderboard type
export async function getLeaderboardAccuracies(leaderboardType: LeaderboardType): Promise<number[]> {

    const leaderboard = await DBLeaderboard.findOne({type: leaderboardType});

    if (!leaderboard) {
        return [];
    }

    // sort by accuracy
    leaderboard.entries.sort((a, b) => b.accuracy - a.accuracy);

    // convert to LeaderboardEntry[]
    const accuracies: number[] = [];
    for (const entry of leaderboard.entries) {
        accuracies.push(entry.accuracy);
    }

    // trim past MAX_LEADERBOARD_ENTRIES
    accuracies.splice(MAX_LEADERBOARD_ENTRIES);

    return accuracies;
}