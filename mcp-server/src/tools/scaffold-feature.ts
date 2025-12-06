/**
 * Scaffold Feature Tool
 * 
 * Creates standardized folder structures for new features
 * following the MVC pattern to prevent wildwuchs.
 */

import * as fs from "fs";
import * as path from "path";

interface ScaffoldResult {
  success: boolean;
  createdFiles: string[];
  errors: string[];
  structure: string;
}

type FeatureType = "page" | "component" | "api" | "hook";

const TEMPLATES = {
  page: {
    files: [
      { name: "page.tsx", template: "PAGE_TEMPLATE" },
      { name: "loading.tsx", template: "LOADING_TEMPLATE" },
      { name: "error.tsx", template: "ERROR_TEMPLATE" },
    ],
    directory: "app",
  },
  component: {
    files: [
      { name: "{{PascalName}}.tsx", template: "COMPONENT_TEMPLATE" },
      { name: "index.ts", template: "INDEX_TEMPLATE" },
    ],
    directory: "components",
  },
  api: {
    files: [{ name: "route.ts", template: "API_ROUTE_TEMPLATE" }],
    directory: "app/api",
  },
  hook: {
    files: [{ name: "use-{{kebab-name}}.ts", template: "HOOK_TEMPLATE" }],
    directory: "hooks",
  },
};

function toPascalCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function getTemplate(type: string, pascalName: string, kebabName: string): string {
  switch (type) {
    case "PAGE_TEMPLATE":
      return `import { Metadata } from "next"

export const metadata: Metadata = {
  title: "${pascalName} | MyDispatch",
  description: "${pascalName} page",
}

export default function ${pascalName}Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">${pascalName}</h1>
      {/* Page content */}
    </div>
  )
}
`;

    case "LOADING_TEMPLATE":
      return `import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
`;

    case "ERROR_TEMPLATE":
      return `"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Ein Fehler ist aufgetreten</h2>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  )
}
`;

    case "COMPONENT_TEMPLATE":
      return `"use client"

import { cn } from "@/lib/utils"

interface ${pascalName}Props {
  className?: string
}

export function ${pascalName}({ className }: ${pascalName}Props) {
  return (
    <div className={cn("", className)}>
      {/* ${pascalName} content */}
    </div>
  )
}
`;

    case "INDEX_TEMPLATE":
      return `export { ${pascalName} } from "./${pascalName}"
`;

    case "API_ROUTE_TEMPLATE":
      return `import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  // Implement GET logic
  
  return NextResponse.json({ message: "Success" })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Implement POST logic
  
  return NextResponse.json({ message: "Created" }, { status: 201 })
}
`;

    case "HOOK_TEMPLATE":
      return `import { useState, useCallback } from "react"

interface Use${pascalName}Options {
  // Options
}

interface Use${pascalName}Return {
  // Return values
}

export function use${pascalName}(options?: Use${pascalName}Options): Use${pascalName}Return {
  // Hook implementation
  
  return {
    // Return values
  }
}
`;

    default:
      return "";
  }
}

export async function scaffoldFeature(
  featureName: string,
  type: FeatureType
): Promise<ScaffoldResult> {
  const result: ScaffoldResult = {
    success: false,
    createdFiles: [],
    errors: [],
    structure: "",
  };

  if (!featureName || !type) {
    result.errors.push("Feature name and type are required");
    return result;
  }

  const kebabName = toKebabCase(featureName);
  const pascalName = toPascalCase(kebabName);
  const config = TEMPLATES[type];

  if (!config) {
    result.errors.push(`Unknown feature type: ${type}`);
    return result;
  }

  const projectRoot = process.cwd();
  const baseDir = path.join(projectRoot, config.directory);
  const featureDir =
    type === "hook" ? baseDir : path.join(baseDir, kebabName);

  // Generate structure preview
  const structureLines = [`${config.directory}/`];
  if (type !== "hook") {
    structureLines.push(`  ${kebabName}/`);
    for (const file of config.files) {
      const fileName = file.name
        .replace("{{PascalName}}", pascalName)
        .replace("{{kebab-name}}", kebabName);
      structureLines.push(`    ${fileName}`);
    }
  } else {
    for (const file of config.files) {
      const fileName = file.name
        .replace("{{PascalName}}", pascalName)
        .replace("{{kebab-name}}", kebabName);
      structureLines.push(`  ${fileName}`);
    }
  }
  result.structure = structureLines.join("\n");

  // Create directory
  try {
    if (!fs.existsSync(featureDir)) {
      fs.mkdirSync(featureDir, { recursive: true });
    }

    // Create files
    for (const file of config.files) {
      const fileName = file.name
        .replace("{{PascalName}}", pascalName)
        .replace("{{kebab-name}}", kebabName);
      const filePath = path.join(featureDir, fileName);
      const content = getTemplate(file.template, pascalName, kebabName);

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        result.createdFiles.push(filePath.replace(projectRoot, ""));
      }
    }

    result.success = true;
  } catch (error) {
    result.errors.push(`Failed to create files: ${error}`);
  }

  return result;
}

