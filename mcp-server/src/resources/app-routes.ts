/**
 * App Routes Resource
 *
 * Scans the /app folder to provide a map of all Next.js routes
 * and API endpoints. Prevents duplicates and dead links.
 *
 * URI: project://app/routes
 */

import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";

interface Route {
  path: string;
  type: "page" | "api" | "layout" | "loading" | "error" | "not-found";
  file: string;
  isDynamic: boolean;
  params?: string[];
}

interface AppRoutes {
  pages: Route[];
  apiRoutes: Route[];
  layouts: Route[];
  middleware: string[];
}

export async function getAppRoutes(): Promise<AppRoutes> {
  const projectRoot = process.cwd();
  const appDir = path.join(projectRoot, "app");

  const routes: AppRoutes = {
    pages: [],
    apiRoutes: [],
    layouts: [],
    middleware: [],
  };

  if (!fs.existsSync(appDir)) {
    return routes;
  }

  try {
    // Find all route files
    const files = await glob("**/*.{tsx,ts}", {
      cwd: appDir,
      ignore: ["**/node_modules/**", "**/_*/**"],
    });

    for (const file of files) {
      const fileName = path.basename(file);
      const dirPath = path.dirname(file);
      const routePath = "/" + dirPath.replace(/\\/g, "/");

      // Extract dynamic params
      const dynamicParams = routePath.match(/\[([^\]]+)\]/g)?.map((p) => p.slice(1, -1)) || [];
      const isDynamic = dynamicParams.length > 0;

      if (fileName === "page.tsx" || fileName === "page.ts") {
        routes.pages.push({
          path: routePath === "/." ? "/" : routePath.replace("/.", "/"),
          type: "page",
          file: `app/${file}`,
          isDynamic,
          params: isDynamic ? dynamicParams : undefined,
        });
      } else if (fileName === "route.ts" || fileName === "route.tsx") {
        routes.apiRoutes.push({
          path: routePath === "/." ? "/" : routePath.replace("/.", "/"),
          type: "api",
          file: `app/${file}`,
          isDynamic,
          params: isDynamic ? dynamicParams : undefined,
        });
      } else if (fileName === "layout.tsx" || fileName === "layout.ts") {
        routes.layouts.push({
          path: routePath === "/." ? "/" : routePath.replace("/.", "/"),
          type: "layout",
          file: `app/${file}`,
          isDynamic,
          params: isDynamic ? dynamicParams : undefined,
        });
      } else if (fileName === "loading.tsx") {
        routes.pages.push({
          path: routePath,
          type: "loading",
          file: `app/${file}`,
          isDynamic,
        });
      } else if (fileName === "error.tsx") {
        routes.pages.push({
          path: routePath,
          type: "error",
          file: `app/${file}`,
          isDynamic,
        });
      } else if (fileName === "not-found.tsx") {
        routes.pages.push({
          path: routePath,
          type: "not-found",
          file: `app/${file}`,
          isDynamic,
        });
      }
    }

    // Check for middleware
    const middlewarePath = path.join(projectRoot, "middleware.ts");
    if (fs.existsSync(middlewarePath)) {
      routes.middleware.push("middleware.ts");
    }

    // Sort routes alphabetically
    routes.pages.sort((a, b) => a.path.localeCompare(b.path));
    routes.apiRoutes.sort((a, b) => a.path.localeCompare(b.path));
    routes.layouts.sort((a, b) => a.path.localeCompare(b.path));

  } catch (error) {
    console.error("Error scanning routes:", error);
  }

  return routes;
}

