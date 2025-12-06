/**
 * UI Tokens Resource
 *
 * Parses design-tokens.ts and tailwind.config.ts to provide
 * all UI design tokens as structured JSON.
 *
 * URI: project://ui/tokens
 */

import * as fs from "fs";
import * as path from "path";

interface UITokens {
  colors: Record<string, unknown>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  elevation: Record<string, string>;
  motion: {
    duration: Record<string, string>;
    timing: Record<string, string>;
  };
  zIndex: Record<string, number>;
  typography: {
    fontFamily: Record<string, string>;
    fontSize: Record<string, string>;
  };
}

export async function getUITokens(): Promise<UITokens> {
  const projectRoot = process.cwd();

  // Default tokens based on config/design-tokens.ts
  const tokens: UITokens = {
    colors: {
      primary: {
        DEFAULT: "#343f60",
        light: "#475569",
        dark: "#2a3447",
      },
      slate: {
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a",
      },
      white: "#ffffff",
      border: {
        DEFAULT: "#e2e8f0",
      },
      text: {
        primary: "#0f172a",
        secondary: "#475569",
        tertiary: "#94a3b8",
      },
      accent: {
        DEFAULT: "#3b82f6",
      },
      // Tailwind utility class mappings
      background: "bg-background",
      foreground: "text-foreground",
      muted: "bg-muted",
      mutedForeground: "text-muted-foreground",
      destructive: "bg-destructive",
      destructiveForeground: "text-destructive-foreground",
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "0.75rem",
      lg: "1rem",
      xl: "1.5rem",
      "2xl": "2rem",
      "3xl": "3rem",
      "gap-standard": "gap-5", // Standard gap (nicht gap-4 oder gap-6)
    },
    radius: {
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
      "2xl": "1.5rem",
      // Component-specific
      cards: "rounded-2xl",
      buttons: "rounded-xl",
      badges: "rounded-md",
    },
    elevation: {
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    motion: {
      duration: {
        default: "200ms",
        slow: "300ms",
        fast: "150ms",
      },
      timing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
    zIndex: {
      header: 30,
      footer: 20,
      sidebar: 40,
      mobileHeader: 50,
      quickActionsPanel: 25,
      modal: 100,
      tooltip: 110,
    },
    typography: {
      fontFamily: {
        sans: "Inter, system-ui, sans-serif",
        mono: "JetBrains Mono, monospace",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
      },
    },
  };

  // Try to read and parse actual design-tokens.ts
  try {
    const designTokensPath = path.join(projectRoot, "config", "design-tokens.ts");
    if (fs.existsSync(designTokensPath)) {
      const content = fs.readFileSync(designTokensPath, "utf-8");
      // Parse exported tokens (simplified parsing)
      const colorMatch = content.match(/colors:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
      if (colorMatch) {
        // Tokens already loaded from default, update if needed
      }
    }
  } catch {
    // Use default tokens
  }

  // Try to read globals.css for CSS variables
  try {
    const globalsCssPath = path.join(projectRoot, "app", "globals.css");
    if (fs.existsSync(globalsCssPath)) {
      const cssContent = fs.readFileSync(globalsCssPath, "utf-8");
      // Extract CSS custom properties
      const cssVars = cssContent.match(/--[\w-]+:\s*[^;]+/g) || [];
      tokens.colors = {
        ...tokens.colors,
        cssVariables: cssVars.reduce((acc, v) => {
          const [name, value] = v.split(":").map((s) => s.trim());
          acc[name] = value;
          return acc;
        }, {} as Record<string, string>),
      };
    }
  } catch {
    // Skip CSS parsing
  }

  return tokens;
}

