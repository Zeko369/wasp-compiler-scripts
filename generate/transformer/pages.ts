import { join } from "node:path";
import { ROOT_PATH, getNicePath, readRecursive } from "../file.js";

export const getRouteConfig = async () => {
  const pagesTree = await readRecursive(join(ROOT_PATH, "./src/client/pages"));

  const mappedOutputs = pagesTree.map((rawPath) => {
    const path = getNicePath(rawPath, "client");

    const withoutDirectives = path
      .split("/")
      .filter((item) => !item.startsWith("(") && !item.endsWith(")"))
      .slice(2);

    const name = withoutDirectives
      .map((part) => part.replace(/[^a-zA-Z0-9]/g, ""))
      .filter((part) => part.length > 0)
      .join("_");

    if (withoutDirectives.at(-1) === "index") {
      withoutDirectives.pop();
    }

    return {
      name,
      path: `/${withoutDirectives.join("/")}`,
      filePath: path.slice(1),
      requiresAuth: path.includes("(auth)"),
    };
  });

  return mappedOutputs
    .map(
      (route) => `route ${route.name}_route { path: "${route.path}", to: ${route.name}_page }
page ${route.name}_page {
  component: import ${route.name}_page_component from "@client/${route.filePath}",${
        route.requiresAuth ? "\n  authRequired: true" : ""
      }
}`
    )
    .join("\n\n");
};
