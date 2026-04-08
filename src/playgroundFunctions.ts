import { importedHelloFn } from "./functions/importedHello.js";
import { importedNowFn } from "./functions/importedNow.js";
import { importedRandomFn } from "./functions/importedRandom.js";

export type PlaygroundFn = () => void | Promise<void>;

export const playgroundFunctions: Record<string, PlaygroundFn> = {
  hello: importedHelloFn,
  now: importedNowFn,
  random: importedRandomFn
};
