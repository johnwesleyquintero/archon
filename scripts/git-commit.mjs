import { exec, execSync } from "child_process";
import readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configuration for commit types and scopes
const commitConfig = {
  types: {
    "src/": { type: "feat", scope: "app" },
    "src/components/": { type: "ui", scope: "components" },
    "src/lib/": { type: "refactor", scope: "lib" },
    "src/hooks/": { type: "refactor", scope: "hooks" },
    "src/styles/": { type: "style", scope: "css" },
    "docs/": { type: "docs", scope: "docs" },
    "scripts/": { type: "chore", scope: "scripts" },
    "src/types/": { type: "types", scope: "types" },
    "src/config/": { type: "config", scope: "config" },
    "src/data/": { type: "data", scope: "data" },
    "src/context/": { type: "refactor", scope: "context" },
    "src/utils/": { type: "refactor", scope: "utils" },
    "src/pages/": { type: "feat", scope: "pages" },
  },
  defaultType: "chore",
  defaultScope: "",
};

// Function to commit changes
function commitAndPushChanges(commitMessage) {
  exec(`git commit -m "${commitMessage}"`, (error) => {
    if (error) {
      console.error(`Error committing changes: ${error.message}`);
      return;
    }
    console.log(`Changes committed with message: ${commitMessage}`);
    exec("git push", (pushError) => {
      if (pushError) {
        console.error(`Error pushing changes: ${pushError.message}`);
        return;
      }
      console.log("Changes pushed successfully.");
    });
  });
}

// Function to suggest commit message based on staged files
function suggestCommitMessage() {
  try {
    const stagedFiles = execSync("git diff --staged --name-only", {
      encoding: "utf8",
    })
      .trim()
      .split("\n");

    if (
      stagedFiles.length === 0 ||
      (stagedFiles.length === 1 && stagedFiles[0] === "")
    ) {
      return null; // No staged changes
    }

    // Determine type and scope based on file paths
    let { type, scope } = {
      type: commitConfig.defaultType,
      scope: commitConfig.defaultScope,
    };

    for (const [pathPrefix, config] of Object.entries(commitConfig.types)) {
      if (stagedFiles.some((file) => file.startsWith(pathPrefix))) {
        type = config.type;
        scope = config.scope;
        break;
      }
    }

    // Basic description based on file count and names
    const description =
      stagedFiles.length === 1
        ? `update ${stagedFiles[0]}`
        : `update ${stagedFiles.length} files`;

    // Add a placeholder for a more detailed body
    return `${type}${scope ? `(${scope})` : ""}: ${description}`;
  } catch (error) {
    console.error(`Error getting staged files: ${error.message}`);
    return null;
  }
}

// Function to confirm commit message with user
function confirmCommitMessage(suggestedMessage, callback) {
  rl.question(
    `Suggested commit message: ${suggestedMessage}\nDo you want to proceed with this message? (yes/no): `,
    (answer) => {
      if (answer.toLowerCase() === "yes") {
        callback(suggestedMessage);
      } else {
        rl.question("Enter your custom commit message: ", (customMessage) => {
          callback(customMessage || suggestedMessage);
        });
      }
    },
  );
}

// Main script
exec("git add .", (addError) => {
  if (addError) {
    console.error(`Error adding files: ${addError.message}`);
    return;
  }
  console.log("All changes added to staging.");

  const suggestedMessage = suggestCommitMessage();

  if (suggestedMessage) {
    confirmCommitMessage(suggestedMessage, commitAndPushChanges);
  } else {
    console.log(
      "No staged changes found or error occurred. No commit and push performed.",
    );
    rl.close();
  }
});
