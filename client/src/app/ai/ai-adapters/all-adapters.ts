import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { LeoDTAdapter, LeoLRAdapter, LeoLassoAdapter } from "./leo-ai-adapter";
import { StackRabbitAIAdapter } from "./stackrabbit-ai-adapter";

export enum AIAdapterType {
    STACK_RABBIT = "StackRabbit",
    LEO_LR = "Leo_LR",
    LEO_DT = "Leo_DT",
    LEO_LASSO = "Leo_Lasso",
}

export const ALL_ADAPTER_TYPES: AIAdapterType[] = [
    AIAdapterType.STACK_RABBIT,
    AIAdapterType.LEO_LR,
    AIAdapterType.LEO_DT,
    AIAdapterType.LEO_LASSO,
];

export const ADAPTER_MAP: { [type in AIAdapterType]: AbstractAIAdapter } = {
    [AIAdapterType.STACK_RABBIT]: new StackRabbitAIAdapter(),
    [AIAdapterType.LEO_LR]: new LeoLRAdapter(),
    [AIAdapterType.LEO_DT]: new LeoDTAdapter(),
    [AIAdapterType.LEO_LASSO]: new LeoLassoAdapter(),
};