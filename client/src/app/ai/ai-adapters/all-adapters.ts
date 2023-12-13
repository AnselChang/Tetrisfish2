import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { LeoLRAdapter } from "./leo-ai-adapter";
import { StackRabbitAIAdapter } from "./stackrabbit-ai-adapter";

export enum AIAdapterType {
    STACK_RABBIT = "StackRabbit",
    LEO_LR = "Leo (LR)",
    LEO_DT = "Leo (DT)",
    LEO_LASSO = "Leo (Lasso)",
    LEO_LR_NORM = "Leo (LR Norm)",
    LEO_DT_NORM = "Leo (DT Norm)",
    LEO_LASSO_NORM = "Leo (Lasso Norm)",
}

export const ALL_ADAPTER_TYPES: AIAdapterType[] = [
    AIAdapterType.STACK_RABBIT,
    AIAdapterType.LEO_LR,
    AIAdapterType.LEO_DT,
    AIAdapterType.LEO_LASSO,
    AIAdapterType.LEO_LR_NORM,
    AIAdapterType.LEO_DT_NORM,
    AIAdapterType.LEO_LASSO_NORM,
];

export const ADAPTER_MAP: { [type in AIAdapterType]: AbstractAIAdapter } = {
    [AIAdapterType.STACK_RABBIT]: new StackRabbitAIAdapter(),
    [AIAdapterType.LEO_LR]: new LeoLRAdapter(),
    [AIAdapterType.LEO_DT]: new LeoLRAdapter(),
    [AIAdapterType.LEO_LASSO]: new LeoLRAdapter(),
    [AIAdapterType.LEO_LR_NORM]: new LeoLRAdapter(),
    [AIAdapterType.LEO_DT_NORM]: new LeoLRAdapter(),
    [AIAdapterType.LEO_LASSO_NORM]: new LeoLRAdapter(),
};