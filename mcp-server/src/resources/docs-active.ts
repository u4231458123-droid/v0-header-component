/**
 * Active Documentation Resource
 *
 * Combines .cursorrules, project_specs.md and critical linter rules
 * into a live rulebook for the AI agent.
 *
 * URI: project://docs/active
 */

import * as fs from "fs";
import * as path from "path";

interface ActiveDocs {
  cursorRules: string;
  projectSpecs: string;
  eslintRules: Record<string, unknown>;
  forbiddenTerms: string[];
  designRules: {
    roundings: Record<string, string>;
    spacing: Record<string, string>;
    activeTabs: string;
  };
  languageRules: {
    code: string;
    ui: string;
    forbiddenTerms: string[];
  };
}

export async function getDocsActive(): Promise<ActiveDocs> {
  const projectRoot = process.cwd();

  const docs: ActiveDocs = {
    cursorRules: "",
    projectSpecs: "",
    eslintRules: {},
    forbiddenTerms: [
      "kostenlos",
      "gratis",
      "free",
      "testen",
      "trial",
      "umsonst",
      "geschenkt",
      "kostenfrei",
    ],
    designRules: {
      roundings: {
        cards: "rounded-2xl",
        buttons: "rounded-xl",
        badges: "rounded-md",
      },
      spacing: {
        standard: "gap-5",
        avoid: "gap-4, gap-6 (use gap-5 instead)",
      },
      activeTabs: "bg-primary text-primary-foreground",
    },
    languageRules: {
      code: "English (variables, functions, classes, interfaces)",
      ui: "German (Sie-Form, DIN 5008)",
      forbiddenTerms: [
        "kostenlos",
        "gratis",
        "free",
        "testen",
        "trial",
      ],
    },
  };

  // Read .cursorrules or .cursor/rules/mydispatch.mdc
  try {
    const cursorRulesPath = path.join(projectRoot, ".cursor", "rules", "mydispatch.mdc");
    if (fs.existsSync(cursorRulesPath)) {
      docs.cursorRules = fs.readFileSync(cursorRulesPath, "utf-8");
    }
  } catch {
    // Skip cursor rules
  }

  // Read project_specs.md
  try {
    const specsPath = path.join(projectRoot, "project_specs.md");
    if (fs.existsSync(specsPath)) {
      docs.projectSpecs = fs.readFileSync(specsPath, "utf-8");
    }
  } catch {
    // Skip project specs
  }

  // Read ESLint config
  try {
    const eslintPath = path.join(projectRoot, ".eslintrc.json");
    if (fs.existsSync(eslintPath)) {
      const eslintConfig = JSON.parse(fs.readFileSync(eslintPath, "utf-8"));
      docs.eslintRules = eslintConfig.rules || {};
    }
  } catch {
    // Skip ESLint rules
  }

  return docs;
}

