import { readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const ROOT_PATH = fileURLToPath(new URL("../../", import.meta.url));

export const readRecursive = async (dir: string): Promise<string[]> => {
  const files = await readdir(dir);

  return (
    await Promise.all(
      files.map(async (file) => {
        const s = await stat(`${dir}/${file}`);
        if (s.isDirectory()) {
          return readRecursive(`${dir}/${file}`);
        }

        return `${dir}/${file}`;
      })
    )
  ).flat();
};

export const getNicePath = (path: string, context: "server" | "client") => {
  const extension = path.split(".").pop();
  return path.slice(
    ROOT_PATH.length + `src/${context}`.length,
    extension ? -(extension.length + 1) : undefined
  );
};
