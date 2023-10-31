/*
Stores the current level, lines, and score.
*/

export default class GameStatus {
    constructor(
        public level: number,
        public lines: number,
        public score: number
    ) {}
}