import { SlotState, SlotType } from "./slot-state";

export class HumanSlotState extends SlotState {
    constructor(
        public readonly userID: string,
    ) {
        super(SlotType.HUMAN);
    }
}