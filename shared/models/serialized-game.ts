// The schema for which a game is transmitted between client and server
// should be fully serializable as a JSON object.

// Stores all data needed for leaderboards/user statistics as their own attributes
// but for individual accuracies, not stored in server, but rederived client-side
// for future-proofing in case we want to add/modify more accuracy stats later

export interface SerializedGame {


    // the game's unique id
    readonly gameID: string,

    // all the placements in the game, as compressed as possible
    readonly placements: SerializedPlacement[];

    // general game info
    readonly startLevel: number,
    readonly inputSpeed: number,
    readonly playstyle: string,
    readonly eligibleForLeaderboard: boolean,

    // score/level/lines
    readonly scoreAtTransitionTo19: number | undefined,
    readonly scoreAtTransitionTo29: number | undefined,
    readonly finalScore: number,
    readonly finalLevel: number,
    readonly finalLines: number,

    // non-accuracy-related game statistics
    readonly tetrisRate: number, // as percent 0-1
    readonly droughtPercent: number, // % in drought as percent 0-1
    readonly tetrisReadiness: number, // as percent 0-1
    readonly iPieceEfficiency: number, // as percent 0-1

    // accuracy-related game statistics
    readonly accuraciesForAllPlacements: number[], // accuracy as a percent 0-1 for every placement in the game used for 10,000 placement calculations
    readonly numMissedAdjustments: number, // number of times the player missed an adjustment
    readonly overallAccuracy: number, // overall accuracy as a percent 0-1
    readonly accuracy100LinesFor29?: number, // accuracy as a percent 0-1 at <=100 lines on 29 speed, or undefined if not level 29
    readonly score100LinesFor29?: number, // score at 100 lines on 29 speed, or undefined if not level 29

    readonly accuracy18: number, // accuracy as a percent 0-1 for 18 speed
    readonly num18: number, // number of placements at 18 speed
    readonly accuracy19: number, // accuracy as a percent 0-1 for 19 speed
    readonly num19: number, // number of placements at 19 speed
    readonly accuracy29: number, // accuracy as a percent 0-1 for 29 speed
    readonly num29: number, // number of placements at 29 speed
    readonly accuracyI: number, // accuracy as a percent 0-1 for I piece
    readonly numI: number, // number of placements with I piece
    readonly accuracyJ: number, // accuracy as a percent 0-1 for J piece
    readonly numJ: number, // number of placements with J piece
    readonly accuracyL: number, // accuracy as a percent 0-1 for L piece
    readonly numL: number, // number of placements with L piece
    readonly accuracyO: number, // accuracy as a percent 0-1 for O piece
    readonly numO: number, // number of placements with O piece
    readonly accuracyS: number, // accuracy as a percent 0-1 for S piece
    readonly numS: number, // number of placements with S piece
    readonly accuracyT: number, // accuracy as a percent 0-1 for T piece
    readonly numT: number, // number of placements with T piece
    readonly accuracyZ: number, // accuracy as a percent 0-1 for Z piece
    readonly numZ: number, // number of placements with Z piece
}

// serialized JSON for a placement.
// since will be sending hundreds of these in a request, need to compress as much as possible
// minimize key names
// index and score/level/lines and be rederived when converting back to a GamePlacement
export interface SerializedPlacement {

    readonly b: string, // board encoded as a string
    readonly c: string, // type of current piece as a character
    readonly n: string, // type of next piece as a character
    readonly r: number, // placement rotation of current piece
    readonly x: number, // placement x position of current piece
    readonly y: number, // placement y position of current piece
    readonly l: number, // number of line clears from placement

}