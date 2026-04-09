import { asyncGenerator } from "./playground/asyncGenerator/asyncGenerator.js";
import { rollingConcurrency } from "./playground/rollingConcurrency/rollingConcurrency.js";
import { topologicalSorting } from "./playground/topologicalSorting/topologicalSorting.js";

export type PlaygroundFn = () => void | Promise<void>;

export const playgroundMapper: Record<string, PlaygroundFn> = {
  asyncGenerator,
  rollingConcurrency,
  topologicalSorting
};
