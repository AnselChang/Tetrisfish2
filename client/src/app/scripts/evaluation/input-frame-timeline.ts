export enum InputSpeed {
    HZ_10 = 10,
    HZ_11 = 11,
    HZ_12 = 12,
    HZ_13 = 13,
    HZ_14 = 14,
    HZ_15 = 15,
    HZ_20 = 20,
    HZ_30 = 30,
}

export const INPUT_SPEED_TO_TIMELINE: { [speed in InputSpeed]: string } = {
    [InputSpeed.HZ_10] : "X.....",
    [InputSpeed.HZ_11] : "X.....X....X....",
    [InputSpeed.HZ_12] : "X....",
    [InputSpeed.HZ_13] : "X....X....",
    [InputSpeed.HZ_14] : "X....X...X...X...",
    [InputSpeed.HZ_15] : "X...",
    [InputSpeed.HZ_20] : "X..",
    [InputSpeed.HZ_30] : "X.",
};

export const ALL_INPUT_SPEEDS = [
    InputSpeed.HZ_10,
    InputSpeed.HZ_11,
    InputSpeed.HZ_12,
    InputSpeed.HZ_13,
    InputSpeed.HZ_14,
    InputSpeed.HZ_15,
    InputSpeed.HZ_20,
    InputSpeed.HZ_30,
];