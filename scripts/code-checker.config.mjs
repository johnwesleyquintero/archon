/**
 * Configuration for the code-checker script.
 * Define the commands to run and their descriptive names.
 */
export const CHECKS = [
  { command: "npm run format", name: "Format Check" },
  { command: "npm run lint", name: "Lint Check" }, // Note: Adjusted to a more common name
  { command: "npm run typecheck", name: "Type Check" },
  //{ command: "npm run test", name: "Unit Tests" },
  { command: "npm run build", name: "Build Check" }, // Kept for future expansion
];

/**
 * Configuration for the large file check.
 */
export const LARGE_FILE_CHECK_CONFIG = {
  MAX_FILE_SIZE_MB: 5, // 5MB limit for source files
  EXCLUDED_DIRECTORIES: [
    "node_modules",
    ".next",
    ".git",
    ".swc",
    ".vscode",
    "dist",
    "build",
  ],
};

/**
 * GitHub Actions specific configurations
 */
export const GITHUB_ACTIONS_CONFIG = {
  // List of allowed secrets that can be used in workflows
  allowedSecrets: ["SNYK_TOKEN"],
  // Warnings to suppress in GitHub Actions workflows
  suppressWarnings: ["context_access_snyk_token"],
};
