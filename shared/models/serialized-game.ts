// The schema for which a game is transmitted between client and server
// should be fully serializable as a JSON object.

// Stores all data needed for leaderboards/user statistics as their own attributes
// but for individual accuracies, not stored in server, but rederived client-side
// for future-proofing in case we want to add/modify more accuracy stats later

export default class SerializedGame {

    constructor(

        // the game's unique id
        public readonly gameID: string,

        // all the placements in the game, as compressed as possible

        // general game info
        public readonly startLevel: number,
        public readonly inputSpeed: number,
        public readonly playstyle: string,
        public readonly eligibleForLeaderboard: boolean,

        // score/level/lines
        public readonly scoreAtTransitionTo19: number,
        public readonly scoreAtTransitionTo29: number,
        public readonly finalScore: number,
        public readonly finalLevel: number,
        public readonly finalLines: number,

        // non-accuracy-related game statistics
        public readonly tetrisRate: number, // as percent 0-1
        public readonly droughtPercent: number, // % in drought as percent 0-1
        public readonly tetrisReadiness: number, // as percent 0-1
        public readonly iPieceEfficiency: number, // as percent 0-1

        // accuracy-related game statistics
        public readonly accuraciesForAllPlacements: number[], // accuracy as a percent 0-1 for every placement in the game used for 10,000 placement calculations
        public readonly numMissedAdjustments: number, // number of times the player missed an adjustment
        public readonly overallAccuracy: number, // overall accuracy as a percent 0-1
        public readonly accuracy18: number, // accuracy as a percent 0-1 for 18 speed, or -1 if no placements at 18
        public readonly accuracy19: number, // accuracy as a percent 0-1 for 19 speed, or -1 if no placements at 19
        public readonly accuracy29: number, // accuracy as a percent 0-1 for 29 speed, or -1 if no placements at 29
        public readonly accuracyI: number, // accuracy as a percent 0-1 for I piece, or -1 if no placements with I piece
        public readonly accuracyJ: number, // accuracy as a percent 0-1 for J piece, or -1 if no placements with J piece
        public readonly accuracyL: number, // accuracy as a percent 0-1 for L piece, or -1 if no placements with L piece
        public readonly accuracyO: number, // accuracy as a percent 0-1 for O piece, or -1 if no placements with O piece
        public readonly accuracyS: number, // accuracy as a percent 0-1 for S piece, or -1 if no placements with S piece
        public readonly accuracyT: number, // accuracy as a percent 0-1 for T piece, or -1 if no placements with T piece
        public readonly accuracyZ: number, // accuracy as a percent 0-1 for Z piece, or -1 if no placements with Z piece
        

    ) {}

}