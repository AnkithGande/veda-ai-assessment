/**
 * Replaces all @/ path alias imports with correct relative paths.
 * Run once before production build.
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "../src");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(full));
    else if (e.name.endsWith(".ts")) files.push(full);
  }
  return files;
}

function aliasToRelative(fromFile, aliasPath) {
  // aliasPath is like "config/env" (after stripping "@/")
  const fromDir = path.dirname(fromFile);
  const targetAbs = path.join(SRC, aliasPath);
  let rel = path.relative(fromDir, targetAbs).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

const files = walk(SRC);
let totalReplaced = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Match both static imports/exports and dynamic import() calls
  // Handles: from "@/foo", import("@/foo"), import("@/foo/bar")
  content = content.replace(
    /(?:from\s+|import\s*\()["']@\/([^"']+)["']/g,
    (match, aliasPath) => {
      const rel = aliasToRelative(file, aliasPath);
      const replaced = match.replace(`@/${aliasPath}`, rel);
      return replaced;
    }
  );

  // Also handle inline import type: import("@/features/...").SomeType
  content = content.replace(
    /import\("@\/([^"']+)"\)/g,
    (match, aliasPath) => {
      const rel = aliasToRelative(file, aliasPath);
      return `import("${rel}")`;
    }
  );

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    const count = (original.match(/@\//g) || []).length;
    totalReplaced += count;
    console.log(`✅ Fixed ${count} import(s) in ${path.relative(SRC, file)}`);
  }
}

console.log(`\nDone — replaced ${totalReplaced} @/ imports across ${files.length} files.`);
