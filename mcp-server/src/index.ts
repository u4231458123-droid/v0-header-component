#!/usr/bin/env node
/**
 * Nexus Bridge - MCP Server for MyDispatch
 *
 * Provides live context about the project to AI agents:
 * - Design tokens (UI/tokens)
 * - Database schema (DB/schema)
 * - App routes (app/routes)
 * - Active documentation (docs/active)
 *
 * Tools:
 * - validate_slug: Validates URL-friendly strings
 * - validate_compliance: Checks code against project specs
 * - scaffold_feature: Creates standardized feature structures
 * - get_project_health: Returns lint/type-check results
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Resources
import { getAppRoutes } from "./resources/app-routes.js";
import { getDBSchema } from "./resources/db-schema.js";
import { getDocsActive } from "./resources/docs-active.js";
import { getUITokens } from "./resources/ui-tokens.js";

// Tools
import { getProjectHealth } from "./tools/get-project-health.js";
import { scaffoldFeature } from "./tools/scaffold-feature.js";
import { validateCompliance } from "./tools/validate-compliance.js";
import { validateSlug } from "./tools/validate-slug.js";
import { queryKnowledgeBase } from "./tools/query-knowledge-base.js";
import { checkDependencies } from "./tools/check-dependencies.js";

const server = new Server(
  {
    name: "nexus-bridge",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "project://ui/tokens",
        name: "UI Design Tokens",
        description: "Tailwind colors, spacings, and fonts as JSON. Prevents color hallucinations.",
        mimeType: "application/json",
      },
      {
        uri: "project://db/schema",
        name: "Database Schema",
        description: "Current database schema (tables, relations, types). Guarantees correct queries.",
        mimeType: "application/json",
      },
      {
        uri: "project://app/routes",
        name: "App Routes",
        description: "Map of all Next.js routes and API endpoints. Prevents duplicates and dead links.",
        mimeType: "application/json",
      },
      {
        uri: "project://docs/active",
        name: "Active Documentation",
        description: "Combined .cursorrules, project_specs.md and critical linter rules.",
        mimeType: "application/json",
      },
    ],
  };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  switch (uri) {
    case "project://ui/tokens":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(await getUITokens(), null, 2),
          },
        ],
      };

    case "project://db/schema":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(await getDBSchema(), null, 2),
          },
        ],
      };

    case "project://app/routes":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(await getAppRoutes(), null, 2),
          },
        ],
      };

    case "project://docs/active":
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(await getDocsActive(), null, 2),
          },
        ],
      };

    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "validate_slug",
        description: "Validates if a string is URL-friendly (lowercase, no umlauts, hyphens)",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The text to validate as a URL slug",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "validate_compliance",
        description: "Checks code snippets against internal rules (German slugs, Zod schemas, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code snippet to validate",
            },
            filePath: {
              type: "string",
              description: "Optional file path for context",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "scaffold_feature",
        description: "Creates standardized folder structures for new features",
        inputSchema: {
          type: "object",
          properties: {
            featureName: {
              type: "string",
              description: "Name of the feature (kebab-case)",
            },
            type: {
              type: "string",
              enum: ["page", "component", "api", "hook"],
              description: "Type of feature to scaffold",
            },
          },
          required: ["featureName", "type"],
        },
      },
      {
        name: "get_project_health",
        description: "Returns results of npm run lint and npm run type-check",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "query_knowledge_base",
        description: "Queries the RAG knowledge base for relevant documents using vector similarity search",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language search query",
            },
            category: {
              type: "string",
              description: "Optional category filter (compliance, architecture, api, etc.)",
            },
            matchThreshold: {
              type: "number",
              description: "Minimum similarity threshold (0-1, default: 0.78)",
            },
            maxResults: {
              type: "number",
              description: "Maximum number of results (default: 10)",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "check_dependencies",
        description: "Validates package.json for conflicts, vulnerabilities, and duplicates",
        inputSchema: {
          type: "object",
          properties: {
            projectRoot: {
              type: "string",
              description: "Optional path to project root",
            },
          },
          required: [],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "validate_slug":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(validateSlug(args?.text as string)),
          },
        ],
      };

    case "validate_compliance":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await validateCompliance(args?.code as string, args?.filePath as string | undefined)
            ),
          },
        ],
      };

    case "scaffold_feature":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await scaffoldFeature(
                args?.featureName as string,
                args?.type as "page" | "component" | "api" | "hook"
              )
            ),
          },
        ],
      };

    case "get_project_health":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(await getProjectHealth()),
          },
        ],
      };

    case "query_knowledge_base":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              await queryKnowledgeBase({
                query: args?.query as string,
                category: args?.category as string | undefined,
                matchThreshold: args?.matchThreshold as number | undefined,
                maxResults: args?.maxResults as number | undefined,
              })
            ),
          },
        ],
      };

    case "check_dependencies":
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(await checkDependencies(args?.projectRoot as string | undefined)),
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Nexus Bridge MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

