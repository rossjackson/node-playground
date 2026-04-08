import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { playgroundFunctions } from "./playgroundFunctions.js";

const promptForFunctionName = async (): Promise<string> => {
  const available = Object.keys(playgroundFunctions);
  const rl = createInterface({ input, output });

  console.log("Available functions:");
  available.forEach((name) => console.log(`- ${name}`));

  const answer = (await rl.question("What function do you want to execute? ")).trim();
  rl.close();

  return answer;
};

const run = async (functionName: string): Promise<void> => {
  const fn = playgroundFunctions[functionName];

  if (!fn) {
    console.error(`Unknown function "${functionName}".`);
    console.log(`Try one of: ${Object.keys(playgroundFunctions).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  await fn();
};

const main = async (): Promise<void> => {
  const argFunctionName = process.argv[2]?.trim();
  const functionName = argFunctionName && argFunctionName.length > 0
    ? argFunctionName
    : await promptForFunctionName();

  await run(functionName);
};

main();
