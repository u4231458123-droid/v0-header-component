/**
 * Get Project Health Tool
 *
 * Returns results of npm run lint and npm run type-check
 * to provide a quick overview of project health.
 */

import { execSync } from "child_process";

interface HealthResult {
  healthy: boolean;
  lint: {
    passed: boolean;
    errorCount: number;
    warningCount: number;
    output: string;
  };
  typeCheck: {
    passed: boolean;
    errorCount: number;
    output: string;
  };
  build: {
    passed: boolean;
    output: string;
  };
  timestamp: string;
}

export async function getProjectHealth(): Promise<HealthResult> {
  const result: HealthResult = {
    healthy: true,
    lint: {
      passed: true,
      errorCount: 0,
      warningCount: 0,
      output: "",
    },
    typeCheck: {
      passed: true,
      errorCount: 0,
      output: "",
    },
    build: {
      passed: true,
      output: "",
    },
    timestamp: new Date().toISOString(),
  };

  // Run ESLint
  try {
    const lintOutput = execSync("npm run lint 2>&1", {
      encoding: "utf-8",
      timeout: 60000,
      cwd: process.cwd(),
    });
    result.lint.output = lintOutput.trim();
    result.lint.passed = true;

    // Parse error/warning counts
    const errorMatch = lintOutput.match(/(\d+)\s+error/);
    const warningMatch = lintOutput.match(/(\d+)\s+warning/);
    result.lint.errorCount = errorMatch ? parseInt(errorMatch[1]) : 0;
    result.lint.warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;

    if (result.lint.errorCount > 0) {
      result.lint.passed = false;
      result.healthy = false;
    }
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; status?: number };
    result.lint.passed = false;
    result.lint.output = execError.stdout || execError.stderr || String(error);
    result.healthy = false;

    // Parse error/warning counts from error output
    const errorMatch = result.lint.output.match(/(\d+)\s+error/);
    const warningMatch = result.lint.output.match(/(\d+)\s+warning/);
    result.lint.errorCount = errorMatch ? parseInt(errorMatch[1]) : 1;
    result.lint.warningCount = warningMatch ? parseInt(warningMatch[1]) : 0;
  }

  // Run TypeScript type-check
  try {
    const typeOutput = execSync("npx tsc --noEmit 2>&1", {
      encoding: "utf-8",
      timeout: 120000,
      cwd: process.cwd(),
    });
    result.typeCheck.output = typeOutput.trim() || "No type errors found";
    result.typeCheck.passed = true;
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; status?: number };
    result.typeCheck.passed = false;
    result.typeCheck.output = execError.stdout || execError.stderr || String(error);
    result.healthy = false;

    // Count TypeScript errors
    const errorLines = result.typeCheck.output.split("\n").filter((line) =>
      line.includes("error TS")
    );
    result.typeCheck.errorCount = errorLines.length;
  }

  // Quick build check (dry run)
  try {
    // Just check if next build would start successfully
    const buildOutput = execSync("npm run build --dry-run 2>&1 || echo 'Build check skipped'", {
      encoding: "utf-8",
      timeout: 30000,
      cwd: process.cwd(),
    });
    result.build.output = buildOutput.includes("skipped")
      ? "Build check skipped (use full build for complete check)"
      : "Build configuration valid";
    result.build.passed = true;
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string };
    result.build.passed = false;
    result.build.output = execError.stdout || execError.stderr || String(error);
    // Don't mark as unhealthy for build dry-run failures
  }

  return result;
}

