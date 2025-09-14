#!/usr/bin/env node
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const ROOT_PAGES = path.join(repoRoot, "pages");
const SRC_DIR = path.join(repoRoot, "src");
const SRC_PAGES = path.join(SRC_DIR, "pages");

const DRY = process.argv.includes("--dry");

function log(...args) {
  console.log("[cleanup]", ...args);
}

async function exists(p) {
  try { await fsp.access(p, fs.constants.F_OK); return true; }
  catch { return false; }
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function walk(dir, exts = [".ts", ".tsx", ".js", ".jsx"]) {
  const out = [];
  async function inner(d) {
    const entries = await fsp.readdir(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        // Skip node_modules and dist
        if (e.name === "node_modules" || e.name === "dist") continue;
        await inner(p);
      } else {
        if (exts.includes(path.extname(e.name))) out.push(p);
      }
    }
  }
  await inner(dir);
  return out;
}

async function moveDirContents(srcDir, dstDir) {
  const entries = await fsp.readdir(srcDir, { withFileTypes: true });
  for (const e of entries) {
    const from = path.join(srcDir, e.name);
    const to = path.join(dstDir, e.name);
    if (e.isDirectory()) {
      if (!DRY) await ensureDir(to);
      log("move dir   :", path.relative(repoRoot, from), "→", path.relative(repoRoot, to));
      if (!DRY) await moveDirContents(from, to);
    } else {
      // If the file already exists at destination, keep the destination and rename the source for safety
      const toExists = await exists(to);
      if (toExists) {
        const backup = to.replace(/(\.\w+)$/, ".bak$1");
        log("exists, keep dst; backup src:", path.relative(repoRoot, from), "→", path.relative(repoRoot, backup));
        if (!DRY) await fsp.copyFile(from, backup);
      } else {
        log("move file  :", path.relative(repoRoot, from), "→", path.relative(repoRoot, to));
        if (!DRY) {
          await ensureDir(path.dirname(to));
          await fsp.rename(from, to);
        }
      }
    }
  }
}

async function rewriteImports(files) {
  // For files OUTSIDE src (like root-level App.tsx, router.tsx, main.tsx),
  // change:  import ... from "./pages/..."  → "./src/pages/..."
  // We only touch *relative* imports that start with ./pages or ../pages from the file's directory.
  const pattern = /(from\s+['"])(\.{1,2}\/)pages(\/[^'"]*)?(['"])/g;

  for (const file of files) {
    const rel = path.relative(repoRoot, file);
    const insideSrc = rel.startsWith("src"+path.sep);
    const text = await fsp.readFile(file, "utf8");

    let replacedText = text;
    if (!insideSrc) {
      replacedText = text.replace(pattern, (m, a, dots, rest = "", d) => {
        // Preserve trailing path
        return `${a}${dots}src/pages${rest}${d}`;
      });
    }

    if (replacedText !== text) {
      log("rewrite    :", rel);
      if (!DRY) await fsp.writeFile(file, replacedText, "utf8");
    }
  }
}

async function removeIfEmpty(dir) {
  try {
    const entries = await fsp.readdir(dir);
    if (entries.length === 0) {
      log("rmdir      :", path.relative(repoRoot, dir));
      if (!DRY) await fsp.rmdir(dir);
    }
  } catch {}
}

async function main() {
  log("repo root  :", repoRoot);
  const hasSrc = await exists(SRC_DIR);
  if (!hasSrc) {
    log("create dir :", path.relative(repoRoot, SRC_DIR));
    if (!DRY) await ensureDir(SRC_DIR);
  }

  const hasRootPages = await exists(ROOT_PAGES);
  if (!hasRootPages) {
    log("No root /pages directory found. Nothing to move.");
  } else {
    const hasSrcPages = await exists(SRC_PAGES);
    if (!hasSrcPages) {
      log("create dir :", path.relative(repoRoot, SRC_PAGES));
      if (!DRY) await ensureDir(SRC_PAGES);
    }
    await moveDirContents(ROOT_PAGES, SRC_PAGES);
  }

  // Rewrite imports in all project files (root and src)
  const files = await walk(repoRoot);
  await rewriteImports(files);

  // Try removing now-empty root /pages
  if (await exists(ROOT_PAGES)) {
    await removeIfEmpty(ROOT_PAGES);
  }

  log(DRY ? "Dry run complete." : "Done.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
