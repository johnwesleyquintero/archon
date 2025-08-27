/**
 * @file Script to automate code quality checks (formatting, linting, type checking).
 *
 * This script runs a series of configured shell commands in parallel and provides
 * consolidated reporting. It is written in pure JavaScript with JSDoc for type
 * safety, requiring no external build tools like TypeScript.
 *
 * It offers two output modes:
 * 1. Human-readable (default): A clean summary followed by a detailed, consolidated
 *    AI prompt for any failures.
 * 2. JSON output (via --json flag): Machine-readable output, ideal for
 *    integration with other tools or AI workflows.
 *
 * @example
 * node scripts/code-checker.mjs
 * node scripts/code-checker.mjs --json
 */

import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

import chalk from "chalk";

import { CHECKS, LARGE_FILE_CHECK_CONFIG } from "./code-checker.config.mjs";

const execPromise = promisify(exec);

// --- Type Definitions via JSDoc for JS-compatibility ---
/** @typedef {import('./code-checker.config.mjs').CHECKS[number]} CheckConfig */
/** @typedef {{filePath: string, line: number, column: number, message: string}} ParsedError */
/** @typedef {{errorsByFile: Map<string, ParsedError[]>, generalOutput: string[]}} ParsedOutput */
/** @typedef {{name: string, success: boolean, command: string, stdout: string, stderr: string, combinedOutput: string, parsedOutput?: ParsedOutput}} CheckResult */

// --- Constants ---
const EXIT_CODES = {
  SUCCESS: 0,
  CHECK_FAILED: 1,
  UNEXPECTED_ERROR: 2,
};

// --- Core Logic ---
async function checkLargeFiles() {
  const { MAX_FILE_SIZE_MB, EXCLUDED_DIRECTORIES } = LARGE_FILE_CHECK_CONFIG;
  const largeFiles = [];

  const traverseDirectory = async (directory) => {
    try {
      const files = await fs.readdir(directory, { withFileTypes: true });
      for (const file of files) {
        const fullPath = path.join(directory, file.name);
        if (file.isDirectory()) {
          if (EXCLUDED_DIRECTORIES.includes(file.name)) {
            continue;
          }
          await traverseDirectory(fullPath);
        } else if (file.isFile()) {
          const stats = await fs.stat(fullPath);
          const fileSizeMB = stats.size / (1024 * 1024);
          if (fileSizeMB > MAX_FILE_SIZE_MB) {
            largeFiles.push({
              filePath: fullPath,
              sizeMB: fileSizeMB.toFixed(2),
            });
          }
        }
      }
    } catch (error) {
      console.error(
        chalk.red(`Error traversing directory ${directory}: ${error.message}`),
      );
    }
  };

  await traverseDirectory(path.resolve(process.cwd()));
  return largeFiles;
}

function parseLinterOutput(output) {
  if (!output) return { errorsByFile: new Map(), generalOutput: [] };
  const lines = output.split("\n");
  const errorsByFile = new Map();
  const generalOutput = [];
  // More flexible pattern to capture various linter outputs (e.g., ESLint, TypeScript)
  // Tries to capture filePath, line, column, and a more specific message/rule if available
  const filePattern =
    /^(?<filePath>[^\s].*?):(?<line>\d+):(?<column>\d+)(?:\s+(?<type>\w+):)?\s*(?<message>.*)$/;

  lines.forEach((line) => {
    const match = line.match(filePattern);
    if (match?.groups?.filePath) {
      const {
        filePath,
        line: lineStr,
        column: colStr,
        type,
        message,
      } = match.groups;
      const parsedError = {
        filePath,
        line: parseInt(lineStr, 10),
        column: parseInt(colStr, 10),
        type: type || "error", // Default to 'error' if not specified
        message: message || line,
      };
      if (!errorsByFile.has(filePath)) errorsByFile.set(filePath, []);
      errorsByFile.get(filePath)?.push(parsedError);
    } else if (line.trim()) {
      generalOutput.push(line);
    }
  });
  return { errorsByFile, generalOutput };
}

async function runCommand(check) {
  const { name, command } = check;
  console.log(chalk.blue(`▶ Running: ${name}...`));
  try {
    const { stdout, stderr } = await execPromise(command);
    return {
      name,
      command,
      success: true,
      stdout,
      stderr,
      combinedOutput: [stdout, stderr].filter(Boolean).join("\n\n"),
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      const errorMessage = `Command not found: ${command.split(" ")[0]}. Please ensure it is installed and in your PATH.`;
      return {
        name,
        command,
        success: false,
        stdout: "",
        stderr: errorMessage,
        combinedOutput: errorMessage,
        parsedOutput: parseLinterOutput(errorMessage),
      };
    } else if (error.code === "EACCES") {
      const errorMessage = `Permission denied: Could not execute command \`${command}\`. Check file permissions.`;
      return {
        name,
        command,
        success: false,
        stdout: "",
        stderr: errorMessage,
        combinedOutput: errorMessage,
        parsedOutput: parseLinterOutput(errorMessage),
      };
    } else if (error.code === "ETIMEDOUT") {
      const errorMessage = `Command timed out: \`${command}\`. Consider increasing the timeout if this is expected.`;
      return {
        name,
        command,
        success: false,
        stdout: "",
        stderr: errorMessage,
        combinedOutput: errorMessage,
        parsedOutput: parseLinterOutput(errorMessage),
      };
    }
    const stdout = error.stdout || "";
    const stderr = error.stderr || "";
    const combinedOutput = [stdout, stderr].filter(Boolean).join("\n\n");
    return {
      name,
      command,
      success: false,
      stdout,
      stderr,
      combinedOutput,
      parsedOutput: parseLinterOutput(combinedOutput),
    };
  }
}

// --- Output & Display ---
function displayHumanReadableOutput(results) {
  const failedChecks = results.filter((r) => !r.success);
  const passedChecks = results.filter((r) => r.success);
  console.log(chalk.bold("\n--- Code Quality Check Summary ---"));

  passedChecks.forEach((check) => {
    console.log(chalk.green(`✓ ${check.name} passed`));
    if (check.stderr && check.stderr.trim()) {
      console.log(
        chalk.yellow(
          `  ⚠ Warnings:\n${chalk.dim(check.stderr.trim().replace(/^/gm, "    "))}`,
        ),
      );
    }
  });

  failedChecks.forEach((check) =>
    console.error(chalk.red(`✗ ${check.name} failed`)),
  );

  if (failedChecks.length > 0) {
    console.error(chalk.bold.red("\nSome checks failed. See details below."));
    const prompt = `The following code quality checks failed. Your task is to provide the necessary code changes or commands to fix these issues.\n\n### Summary of Failures:\n${failedChecks.map((check) => `- **Check:** ${check.name}\n- **Command:** \`${check.command}\`\n- **Error Output:**\n\`\`\`\n${check.combinedOutput.trim()}\n\`\`\``).join("\n\n")}\n\nPlease analyze the error output for each failed check and provide a plan or code patch to resolve the problems.`;
    console.log(
      chalk.bold.cyan("\n--- AI Task Prompt for Failed Checks ---\n"),
    );
    console.log(prompt);
    console.log(chalk.bold.cyan("\n------------------------------------"));
  } else {
    console.log(chalk.bold.green("\n✨ All checks passed successfully!"));
  }
}

function displayJsonOutput(results) {
  const serializableResults = results.map((result) => {
    if (result.parsedOutput) {
      return {
        ...result,
        parsedOutput: {
          errorsByFile: Object.fromEntries(result.parsedOutput.errorsByFile),
          generalOutput: result.parsedOutput.generalOutput,
        },
      };
    }
    return result;
  });
  console.log(JSON.stringify({ results: serializableResults }, null, 2));
}

// --- Main Orchestration ---
async function main() {
  const useJsonOutput = process.argv.includes("--json");
  if (!useJsonOutput)
    console.log(chalk.bold("\nRunning Code Quality Checks..."));

  try {
    const largeFiles = await checkLargeFiles();
    if (largeFiles.length > 0) {
      console.warn(chalk.yellow("\n--- Large Files Detected ---"));
      largeFiles.forEach((file) => {
        console.warn(chalk.yellow(`  - ${file.filePath} (${file.sizeMB} MB)`));
      });
      console.warn(
        chalk.yellow(
          "Consider optimizing or splitting these files to improve performance and reduce memory usage.",
        ),
      );
    }

    const results = await Promise.all(CHECKS.map((check) => runCommand(check)));
    const allPassed = results.every((result) => result.success);

    if (useJsonOutput) displayJsonOutput(results);
    else displayHumanReadableOutput(results);

    process.exit(allPassed ? EXIT_CODES.SUCCESS : EXIT_CODES.CHECK_FAILED);
  } catch (error) {
    console.error(chalk.bold.red("\nAn unexpected error occurred:"), error);
    process.exit(EXIT_CODES.UNEXPECTED_ERROR);
  }
}

main();
