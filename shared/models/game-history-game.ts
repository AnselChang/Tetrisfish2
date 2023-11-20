/*
Minimal info needed to represent a game as an entry for game history list
*/

export interface GameHistoryGame {

    readonly timestamp: string,
    readonly gameID: string,
    readonly startLevel: number,

    readonly score19: number | null | undefined, // score at transition to 19 speed
    readonly score29: number | null | undefined, // score at transition to 29 speed
    readonly finalScore: number,
    readonly finalLevel: number,

    readonly overallAccuracy: number, // overall accuracy as a percent 0-1
    readonly accuracy18: number | null | undefined, // accuracy as a percent 0-1 for 18 speed
    readonly accuracy19: number | null | undefined, // accuracy as a percent 0-1 for 19 speed

    readonly droughtPercent: number, // % in drought as percent 0-1
    readonly tetrisReadiness: number, // as percent 0-1
    readonly iPieceEfficiency: number, // as percent 0-1

    readonly leaderboardRank?: number | null | undefined, // rank in leaderboard, of undefined if none

}