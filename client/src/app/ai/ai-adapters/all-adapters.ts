import { AbstractAIAdapter } from "../abstract-ai-adapter/abstract-ai-adapter";
import { StackRabbitAIAdapter } from "./stackrabbit-ai-adapter";

export const ALL_ADAPTERS: AbstractAIAdapter[] = [
    new StackRabbitAIAdapter(),
];