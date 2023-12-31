import { SerializedPlacement } from "./serialized-game";

export interface GameFromDatabase {
    timestamp: string,
    discordID: string,
    playerName: string,
    gameID: string,
    placements: SerializedPlacement[],
    startLevel: number,
    inputSpeed: number,
    playstyle: string,
}