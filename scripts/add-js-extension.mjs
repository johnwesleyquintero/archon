import fs from "fs";
import path from "path";

const directory = process.argv[2] || ".";

function addJsExtension(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".next") {
        addJsExtension(filePath);
      }
    } else if (filePath.endsWith(".ts") || filePath.endsWith(".tsx")) {
      let content = fs.readFileSync(filePath, "utf8");
      const originalContent = content;

      // Add .js extension to relative imports
      content = content.replace(
        /from\s+['"](\.\.?\/[^'"]+)['"]/g,
        (match, p1) => {
          if (!p1.endsWith(".js")) {
            return `from '${p1}.js'`;
          }
          return match;
        },
      );

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Updated imports in: ${filePath}`);
      }
    }
  });
}

addJsExtension(directory);
