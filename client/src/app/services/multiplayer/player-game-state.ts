import { TetrominoType } from "../../models/tetronimo-models/tetromino";

export interface IActiveGameState {
    overallAccuracy: number;
    currentMoveEval: number;
    bestMoveEval: number;
    tetrisRate: number;
}

export interface IGameState {
    level: number;
    lines: number;
    score: number;
    nextPieceType: TetrominoType | undefined;
    isPaused: boolean;
    game?: IActiveGameState;
}

// attributes that only make sense when inside a game tetrisfish identifies
export class ActiveGameState {
    constructor(
      public readonly overallAccuracy: number,
      public readonly currentMoveEval: number,
      public readonly bestMoveEval: number,
      public readonly tetrisRate: number
    ) {}
  
    equals(other?: ActiveGameState): boolean {
  
      if (!other) return false;
  
      return this.overallAccuracy === other.overallAccuracy &&
        this.currentMoveEval === other.currentMoveEval &&
        this.bestMoveEval === other.bestMoveEval &&
        this.tetrisRate === other.tetrisRate;
    }

    getJson(): IActiveGameState {
        return {
            overallAccuracy: this.overallAccuracy,
            currentMoveEval: this.currentMoveEval,
            bestMoveEval: this.bestMoveEval,
            tetrisRate: this.tetrisRate,
        }
    }

  }
  
  // data for player's board/level/etc that is sent, excluding board state
  // if there was a change, then update to server
  export class PlayerGameState {
    constructor(
      public readonly level: number,
      public readonly lines: number,
      public readonly score: number,
      public readonly nextPieceType: TetrominoType | undefined,
      public readonly isPaused: boolean,
      public readonly game?: ActiveGameState, // if not in game, then this is undefined
    ) {}
  
    // check if it's equal. useful for checking if there was a change. you'd want to send to server only if there was a change
    equals(other: PlayerGameState): boolean {
  
      const gameEqual = this.game === undefined ? other.game === undefined : this.game.equals(other.game);
  
      return this.level === other.level &&
        this.lines === other.lines &&
        this.score === other.score &&
        this.nextPieceType === other.nextPieceType &&
        this.isPaused === other.isPaused &&
        gameEqual;
    }

    getJson(): IGameState {
        return {
            level: this.level,
            lines: this.lines,
            score: this.score,
            nextPieceType: this.nextPieceType,
            isPaused: this.isPaused,
            game: this.game ? this.game.getJson() : undefined,
        }
    }
}

export class GameStateManager {
    private allGameState: {[slotID: string]: IGameState} = {};
    private allScoreDeltas: {[slotID: string]: number} = {};

    private topSlotID: string | undefined;
  
    public getGameState(slotID: string): IGameState {
  
      if (!this.allGameState[slotID]) {
        this.allGameState[slotID] = {
            level: 0,
            lines: 0,
            score: 0,
            nextPieceType: undefined,
            isPaused: false,
            game: undefined,
        }
      }
      return this.allGameState[slotID];
    }

    public getScoreDelta(slotID: string): number {
        if (!this.allScoreDeltas[slotID]) return 0;
        return this.allScoreDeltas[slotID];
    }

    public getTopSlotID(): string | undefined {
        return this.topSlotID;
    }
  
    public setGameState(slotID: string, state: IGameState) {

        this.allGameState[slotID] = new PlayerGameState(
            state.level,
            state.lines,
            state.score,
            state.nextPieceType,
            state.isPaused,
            state.game ? new ActiveGameState(
                state.game.overallAccuracy,
                state.game.currentMoveEval,
                state.game.bestMoveEval,
                state.game.tetrisRate,
            ) : undefined,
        );

        this.updateScoreDeltas();
    }

    private updateScoreDeltas() {
        // now, finding the top two scores which will be used to calculate deltas
        let topSlotID;
        let secondSlotID;
        for (const slotID in this.allGameState) {
            const score = this.allGameState[slotID].score;
            if (topSlotID === undefined || score > this.allGameState[topSlotID].score) {
                secondSlotID = topSlotID;
                topSlotID = slotID;
            } else if (secondSlotID === undefined || score > this.allGameState[secondSlotID].score) {
                secondSlotID = slotID;
            }
        }

        // for all slots that are not slot, delta is with respect to top slot
        // for top slot, delta is with respect to second slot
        for (const slotID in this.allGameState) {
            if (topSlotID === undefined || secondSlotID === undefined) this.allScoreDeltas[slotID] = 0;
            else if (slotID === topSlotID) {
                this.allScoreDeltas[slotID] = this.allGameState[slotID].score - this.allGameState[secondSlotID].score;
            } else {
                this.allScoreDeltas[slotID] = this.allGameState[slotID].score - this.allGameState[topSlotID].score;
            }
        }

        this.topSlotID = topSlotID;

    }
  }