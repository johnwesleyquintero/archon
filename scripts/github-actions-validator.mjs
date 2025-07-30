#!/usr/bin/env node

/**
 * GitHub Actions Workflow Validator
 *
 * This script validates GitHub Actions workflow files against the configuration
 * defined in code-checker.config.mjs to ensure they follow best practices and
 * security guidelines.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GITHUB_ACTIONS_CONFIG } from "./code-checker.config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workflowsDir = path.join(__dirname, "..", ".github", "workflows");

// Patterns to check in workflow files
const PATTERNS = {
  secretsUsage: /\$\{\{\s*secrets\.(\w+)\s*\}\}/g,
};

/**
 * Validates a workflow file against the configuration
 */
function validateWorkflow(filePath) {
  console.log(`Validating workflow: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, "utf8");
  let issues = [];

  // Check for secrets usage
  const secretMatches = [...content.matchAll(PATTERNS.secretsUsage)];
  for (const match of secretMatches) {
    const secretName = match[1];
    if (!GITHUB_ACTIONS_CONFIG.allowedSecrets.includes(secretName)) {
      issues.push(`Unauthorized secret usage: ${secretName}`);
    }
  }

  // Check for suppressed warnings in comments
  const hasSuppressionComment = GITHUB_ACTIONS_CONFIG.suppressWarnings.some(
    (warning) => {
      return content.includes(`# github-actions: suppressWarning=${warning}`);
    },
  );

  // If using SNYK_TOKEN but no suppression comment, flag it
  if (content.includes("SNYK_TOKEN") && !hasSuppressionComment) {
    issues.push("SNYK_TOKEN used without suppression comment");
  }

  return issues;
}

/**
 * Main function to validate all workflow files
 */
function validateAllWorkflows() {
  if (!fs.existsSync(workflowsDir)) {
    console.error(`Workflows directory not found: ${workflowsDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(workflowsDir)
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
    .map((file) => path.join(workflowsDir, file));

  let hasIssues = false;

  for (const file of files) {
    const issues = validateWorkflow(file);

    if (issues.length > 0) {
      console.error(`\nIssues in ${path.basename(file)}:`);
      issues.forEach((issue) => console.error(` - ${issue}`));
      hasIssues = true;
    } else {
      console.log(` ✓ No issues found`);
    }
  }

  if (hasIssues) {
    console.error("\nValidation failed with issues.");
    process.exit(1);
  } else {
    console.log("\nAll workflows validated successfully!");
  }
}

// Run the validation
validateAllWorkflows();
