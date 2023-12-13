/*
A struct for a set of configurations for a bot
*/

import { InputSpeed } from "../scripts/evaluation/input-frame-timeline";
import { AIAdapterType, ALL_ADAPTER_TYPES } from "./ai-adapters/all-adapters";
import { ALL_RNG_TYPES, RNGType } from "./piece-sequence-generation/all-rng";

export enum Linecap {
    NOCAP = 0,
    CAP29 = 29,
    CAP39 = 39,
    CAP49 = 49
}

export class BotConfig {

    public aiType: AIAdapterType = ALL_ADAPTER_TYPES[0];
    public variant: string = "";
    public inputSpeed: InputSpeed = InputSpeed.HZ_30;
    public reactionTimeFrames: number = 0;

    public startLevel: number = 18;
    public linecap: Linecap = Linecap.NOCAP;
    public rngType: RNGType = ALL_RNG_TYPES[0];
    public misdropRate: number = 0; // 0-1 indicating the probability of a misdrop

    

}