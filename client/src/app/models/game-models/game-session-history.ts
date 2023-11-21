// Model for basic game information to be displayed in the game history
export class HistoricalGame {
    constructor(
        public readonly date: Date, // the date the game was played
        public readonly startLevel: number,
        public readonly score: number, // final score of the game
        public readonly level: number, // final level of the game
        public readonly lines: number, // final lines of the game
        public readonly accuracy: number, // average accuracy
        public readonly rank?: number, // rank in leaderboard, of undefined if none
    ) {}
}

// Stores a list of historical games
export default class GameSessionHistory {

    private games: HistoricalGame[] = [];
    private readonly GAME_AVERAGE_COUNT = 5;

    public addGame(game: HistoricalGame): void {
        this.games.push(game);
    }

    // get the GAME_AVERAGE_COUNT most recent games
    private getLastCountGames(): HistoricalGame[] {
        return this.games.slice(-this.GAME_AVERAGE_COUNT);
    }

    public getAverageScore(): number | undefined {
        if (this.games.length === 0) return undefined;
        return this.getLastCountGames().reduce((sum, game) => sum + game.score, 0) / Math.min(this.GAME_AVERAGE_COUNT, this.games.length);
    }

    public getAverageAccuracy(): number | undefined {
        if (this.games.length === 0) return undefined;
        return this.getLastCountGames().reduce((sum, game) => sum + game.accuracy, 0) / Math.min(this.GAME_AVERAGE_COUNT, this.games.length);
    }

    public getAverageCount(): number {
        return this.GAME_AVERAGE_COUNT;
    }

    public getGames(): HistoricalGame[] {
        return this.games;
    }
}