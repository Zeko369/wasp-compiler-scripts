// @ts-check

import "@total-typescript/ts-reset";

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chokidar from "chokidar";

import { getRouteConfig } from "./transformer/pages.js";
import { getPrismaOutput } from "./transformer/prisma.js";
import { getRPCOutput } from "./transformer/rpc.js";
import { ROOT_PATH } from "./file.js";

const generate = async () => {
  const pagesOutput = await getRouteConfig();
  const prismaOutput = await getPrismaOutput();
  const rpcOutput = await getRPCOutput();

  let content = await readFile(join(ROOT_PATH, "./main.wasp"), "utf-8");

  content = replaceSection(content, "ROUTES", pagesOutput);
  content = replaceSection(content, "PRISMA", prismaOutput);
  content = replaceSection(content, "RPC", rpcOutput);

  await writeFile(join(ROOT_PATH, "./main.wasp"), content);
};

const replaceSection = (content: string, section: string, newContent: string) => {
  const [before, after] = content.split(`// ${section}:START`);
  const [_, afterAfter] = after.split(`// ${section}:END`);
  return `${before}// ${section}:START\n${newContent}\n// ${section}:END${afterAfter}`;
};

const args = process.argv.slice(2);
// if (args.includes("--watch")) {
//   setInterval(() => {
//     console.log(`${new Date().toLocaleTimeString()} | Compiling...`);
//     generate();
//   }, 1000);
// } else {
generate().finally(() => {
  console.log("Compiled!");
  process.exit(0);
});
// }
