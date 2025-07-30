/**
 * Configuration for the code-checker script.
 * Define the commands to run and their descriptive names.
 */
export const CHECKS = [
  { command: "npm run format", name: "Format Check" },
  { command: "npm run lint", name: "Lint Check" }, // Note: Adjusted to a more common name
  { command: "npm run typecheck", name: "Type Check" },
  { command: "npm run test", name: "Unit Tests" }, // Kept for future expansion
];
