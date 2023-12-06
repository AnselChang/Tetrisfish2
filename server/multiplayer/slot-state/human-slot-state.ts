import { SlotState, SlotType } from "./slot-state";

export class HumanSlotState extends SlotState {

    public board: Uint8Array | undefined;

    constructor(
        public readonly userID: string,
    ) {
        super(SlotType.HUMAN);
    }

    setBoard(board: Uint8Array | undefined): void {
        this.board = board;
    }

    getBoard(): Uint8Array | undefined {
        return this.board;
    }
}