import { assertCoverage } from "../deno/coverage.ts";

await assertCoverage({ dir: ".coverage", threshold: 90, exclude: ["_test"] })
  .catch((error: Error) => {
    console.error(error.message);
    Deno.exit(1);
  })
  .then(() => console.log("Coverage is above 90% threshold"));
