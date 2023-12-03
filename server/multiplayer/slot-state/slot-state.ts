export enum SlotType {
    VACANT = "VACANT",
    HUMAN = "HUMAN",
    AI = "AI"
}

export abstract class SlotState {
    constructor(
        public readonly type: SlotType
    ) {}
}