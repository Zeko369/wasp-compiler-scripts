import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ROOT_PATH } from "../file.js";

export const getPrismaOutput = async () => {
  const content = await readFile(join(ROOT_PATH, "./prisma/schema.prisma"), "utf-8");

  const models: { name: string; fields: string[] }[] = [];
  let currentModel: (typeof models)[number] = { name: "", fields: [] };

  for (const line of content.split("\n")) {
    if (line.startsWith("model")) {
      currentModel = {
        name: line.split(" ")[1]!,
        fields: [],
      };

      models.push(currentModel);
      continue;
    }

    if (line.trim() === "}") {
      continue;
    }

    currentModel.fields.push(line);
  }

  return models
    .map(
      (model) => `entity ${model.name} {=psl
${model.fields.join("\n")}
psl=}`
    )
    .join("\n\n");
};
