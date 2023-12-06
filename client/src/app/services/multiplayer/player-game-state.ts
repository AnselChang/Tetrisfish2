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
    }
  }