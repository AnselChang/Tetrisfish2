import { SerializedGame } from "shared/models/serialized-game";
import DBLeaderboard, { LeaderboardEntry, LeaderboardType } from "./leaderboard-schema";
import { getUserByID } from "../user/user-service";

const MAX_LEADERBOARD_ENTRIES = 100;
const MAX_LEADERBOARD_ENTRIES_WITH_BUFFER = 110; // 10 extra entries to reduce chance of  race conditions

// if game is good enough for leaderboard, add it to the leaderboard and remove the worst game if full
// return success/error message
export async function addGameToLeaderboard(game: SerializedGame, userID: string): Promise<[string, string]> {

    // check if game is eligible for leaderboard
    if (!game.eligibleForLeaderboard) {
        return ["none", "Note: game was not submitted to leaderboard because it was ineligible."]
    }

    let leaderboardType: LeaderboardType;
    if (game.startLevel === 18 || game.startLevel === 19) {
        leaderboardType = LeaderboardType.OVERALL;
    } else if (game.startLevel === 29) {
        leaderboardType = LeaderboardType.START_29;
    } else {
        return ["none", "Note: game was not submitted to leaderboard because it was ineligible."]
    }

    if (leaderboardType === LeaderboardType.OVERALL && game.finalLines < 230) {
        console.log("18/29 start game did not reach 230 lines, not eligible for leaderboard");
        return ["info", "Note: game was not submitted to leaderboard because game did not reach 230 lines."]
    }

    if (leaderboardType === LeaderboardType.START_29 && game.finalLines < 100) {
        console.log("29 start game did not reach 100 lines, not eligible for leaderboard");
        return ["info", "Note: game was not submitted to leaderboard because game did not reach 100 lines."]
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

    const gameAccuracy = game.startLevel === 29 ? game.accuracy100LinesFor29! : game.overallAccuracy;
    
    // check if game is better than the worst game in the leaderboard using leaderboard's lowestAccuracy cache
    if (leaderboard.entries.length >=  MAX_LEADERBOARD_ENTRIES && gameAccuracy < leaderboard.lowestAccuracy) {
        return ["warning", "Note: although the game qualified for leaderboards, game accuracy was not high enough for the top 100."]

    }

    // get user info
    const user = await getUserByID(userID);

    if (!user) {
        console.error("User does not exist:", userID);
        return ["error", "Error adding game to leaderboard: you do not exist."]
    }

    console.log("Adding game to leaderboard:", game.gameID, user.username);

    // add the game to the leaderboard
    leaderboard.entries.push({
        gameID: game.gameID,
        discordID: userID,
        playerName: user.username,
        isProUser: user.isProUser,
        timestamp: (new Date()).toISOString(),
        startLevel: game.startLevel,
        inputSpeed: game.inputSpeed,
        playstyle: game.playstyle,
        tetrisReadiness: game.tetrisReadiness,
        score: game.finalScore,
        accuracy: gameAccuracy,
    });

    // if leaderboard is full, remove the worst game
    if (leaderboard.entries.length > MAX_LEADERBOARD_ENTRIES_WITH_BUFFER) {
        leaderboard.entries.sort((a, b) => a.accuracy - b.accuracy);
        leaderboard.entries.shift(); // remove the worst game
        console.log("Removed worst game from leaderboard:", leaderboardType);
    }

    // update the lowest accuracy cache
    leaderboard.lowestAccuracy = leaderboard.entries[0].accuracy;

     // get the ranking of the game
    const gameRankIndex = leaderboard.entries.findIndex(entry => entry.gameID === game.gameID);
    console.log("GAME RANK", gameRankIndex+1);

    // save the leaderboard
    await leaderboard.save();

    return ["success", `Congratulations! Your game ranked #${gameRankIndex+1} on the leaderboard!`];

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