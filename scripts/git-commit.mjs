import { exec, execSync } from "child_process";
import readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configuration for commit types and scopes
const commitConfig = {
  types: {
    "app/": { type: "feat", scope: "app" },
    "components/": { type: "ui", scope: "components" },
    "lib/": { type: "refactor", scope: "lib" },
    "hooks/": { type: "refactor", scope: "hooks" },
    "styles/": { type: "style", scope: "css" },
    "docs/": { type: "docs", scope: "docs" },
    "scripts/": { type: "chore", scope: "scripts" },
    "types/": { type: "types", scope: "types" },
    "contexts/": { type: "refactor", scope: "context" },
    "app/api/": { type: "api", scope: "api" },
    "app/auth/": { type: "auth", scope: "auth" },
    "app/dashboard/": { type: "feat", scope: "dashboard" },
    "app/goals/": { type: "feat", scope: "goals" },
    "app/journal/": { type: "feat", scope: "journal" },
    "app/settings/": { type: "feat", scope: "settings" },
    "app/tasks/": { type: "feat", scope: "tasks" },
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
