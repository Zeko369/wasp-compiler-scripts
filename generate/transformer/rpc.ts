import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { getNicePath, readRecursive, ROOT_PATH } from "../file.js";

export const getRPCOutput = async () => {
  const rpcTree = await readRecursive(join(ROOT_PATH, "./src/server/modules"));
  const allRPCs = rpcTree
    .map((path) => {
      if (path.endsWith("Query.ts")) {
        return ["query", path] as const;
      }
      if (path.endsWith("Action.ts")) {
        return ["action", path] as const;
      }
      if (path.endsWith("Router.ts")) {
        return ["router", path] as const;
      }

      return null;
    })
    .filter(Boolean);

  const output = await Promise.all(
    allRPCs.map(async ([type, path]) => {
      const lines = (await readFile(path, "utf-8")).split("\n");
      const RPCs: { name: string; entities: string; type: "query" | "action" }[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^export const [a-zA-Z0-9]+:/)) {
          const name = lines[i].split("export const ")[1].split(":")[0];
          const entities = lines[i - 1].split("// entities: ")[1];
          const type = name.endsWith("Query") ? "query" : "action";

          RPCs.push({ name, entities, type });
        }
      }

      return { path: getNicePath(path, "server"), RPCs };
    })
  );

  return output
    .map(({ path, RPCs }) => {
      const actions = RPCs.map(
        (rpc) => `${rpc.type} ${rpc.name.slice(0, -rpc.type.length)} {
  fn: import { ${rpc.name} } from "@server${path}",${
          rpc.entities ? `\n  entities: ${rpc.entities}` : ""
        }
}`
      ).join("\n");

      return `// ./src/server${path}\n${actions}\n`;
    })
    .join("\n");
};
