import BinaryGrid from "../../models/tetronimo-models/binary-grid";
import { SmartGameStatus } from "../../models/tetronimo-models/smart-game-status";
import { TetrominoType } from "../../models/tetronimo-models/tetromino";
import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { PieceSequenceGenerator } from "../piece-sequence-generation/piece-sequence-generator";
import { SimulationPlacement } from "./simulation-placement";
import { SimulationState } from "./simulation-state";

// Manages the simulation of a full game and its placements for an AI
export class AISimulation {

    readonly startingState: SimulationState; // the state at the very beginning of the game
    readonly allPlacements: SimulationPlacement[] = [];

    constructor(
        public readonly ai: AbstractAIAdapter, // the AI model to use
        public readonly rng: PieceSequenceGenerator, // the piece sequence generation algorithm to use
        public readonly startLevel: number = 18,
    ) {

        const startingPiece = this.generateNextPiece();
        const startingNextBoxPiece = this.generateNextPiece();
        this.startingState = new SimulationState(new BinaryGrid(), startingPiece, startingNextBoxPiece, new SmartGameStatus(startLevel));
    }

    private generateNextPiece(): TetrominoType {
        return this.rng.getNextPiece();
    }

    // get the board state after the last placement, or the starting board state if no placements
    public getLastState(): SimulationState {
        if (this.allPlacements.length === 0) {
            return this.startingState;
        }

        const lastPlacement = this.allPlacements[this.allPlacements.length - 1];

        // if the last placement hasn't computed the state after, throw an error
        if (!lastPlacement.hasComputedPlacement()) {
            throw new Error("Last placement has not computed the state after");
        }

        return lastPlacement.getStateAfter()!;
    }

    // simulate one placement at the end of the game so far, add it to the list, and return it
    public async simulateOnePlacement(): Promise<SimulationPlacement> {

        const lastState = this.getLastState();
        const nextPiece = this.generateNextPiece();

        // create the placement
        const newPlacement = new SimulationPlacement(this.ai, lastState);

        // compute the placement
        await newPlacement.compute(nextPiece);

        // add the placement to the list
        this.allPlacements.push(newPlacement);

        return newPlacement;
    }

}