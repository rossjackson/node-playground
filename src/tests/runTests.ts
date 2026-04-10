import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface RunTests<TRequest, TResponse> {
  inputsFilename: string;
  outputsFilename: string;
  processData: (inputs: TRequest) => TResponse;
}

export const runTests = <TRequest, TResponse>({
  inputsFilename,
  outputsFilename,
  processData,
}: RunTests<TRequest, TResponse>) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const inputPath = path.join(__dirname, "..", "files", inputsFilename);
    const expectedPath = path.join(__dirname, "..", "files", outputsFilename);

    const inputs: TRequest[] = JSON.parse(fs.readFileSync(inputPath, "utf8"));
    const expectedOutputs: TResponse[] = JSON.parse(
      fs.readFileSync(expectedPath, "utf8"),
    );

    console.log(`Running ${inputs.length} test cases...\n`);

    inputs.forEach((input: TRequest, index: number) => {
      const result = processData(input);
      const passed =
        JSON.stringify(result) === JSON.stringify(expectedOutputs[index]);

      if (passed) {
        console.log(`  Test ${index + 1}: Passed`);
      } else {
        console.error(`\tTest ${index + 1}: Failed`);
        console.error(`\n\tExpected:\n\t`, expectedOutputs[index]);
        console.error(`\n\tGot:\n\t`, result);
      }
    });
  } catch (err) {
    console.error("Error reading test files:", (err as Error).message);
  }
};
