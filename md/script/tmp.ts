import { evalCodeBlocks } from "./evalCodeBlocks.ts";

const filePath = "./readme.md";
const markdown = await Deno.readTextFile(filePath);

const results = await evalCodeBlocks(filePath);

//console.log(results);
