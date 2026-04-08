import { asyncGenerator } from "./playground/asyncGenerator/asyncGenerator.js";
import { rollingConcurrency } from "./playground/rollingConcurrency/rollingConcurrency.js";

export type PlaygroundFn = () => void | Promise<void>;

export const playgroundMapper: Record<string, PlaygroundFn> = {
  asyncGenerator,
  rollingConcurrency
};
