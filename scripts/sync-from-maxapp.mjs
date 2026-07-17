#!/usr/bin/env node
/**
 * sync-from-maxapp.mjs — keep the web app's SHARED DATA in sync with the iOS repo.
 *
 * The web app (Next.js) and the iOS app (React Native) are a thin client + native
 * client on the SAME backend, so all *dynamic* data (scans, marketplace, chat,
 * schedules, subscription…) is already identical — it comes from the same API.
 *
 * What this script syncs is the handful of PURE-TS content/logic modules that
 * live in the app bundle (not the API): course curricula, the habit catalog, the
 * task-step catalog, and tone copy. These are the "same data source" the app
 * reads locally. UI (RN StyleSheets) is intentionally NOT synced — it can't be;
 * it is hand-ported screen by screen (see PARITY.md).
 *
 * Usage:
 *   node scripts/sync-from-maxapp.mjs            # sync from /Users/home/maxapp
 *   MAXAPP_DIR=/path/to/maxapp node scripts/sync-from-maxapp.mjs
 *   node scripts/sync-from-maxapp.mjs --check    # report drift, write nothing
 *
 * It is idempotent and applies deterministic import-path rewrites so the copied
 * modules resolve from their new location. Any file carrying react-native / asset
 * imports is skipped and reported (those need a hand port).
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAXAPP = process.env.MAXAPP_DIR || "/Users/home/maxapp";
const MOBILE = join(MAXAPP, "mobile");
const CHECK = process.argv.includes("--check");

const RN_MARKER =
  /from\s+['"]react-native|from\s+['"]expo|require\(\s*['"][^'"]+\.(png|jpg|jpeg|svg|gif)['"]\s*\)|from\s+['"]@react-navigation/;

/**
 * Each entry: a file to sync + the import-path rewrites needed at its new home.
 * `rewrites` is a list of [from, to] applied with String.replaceAll.
 */
const FILES = [
  {
    src: "data/courseContent.ts",
    dest: "lib/max/courses/courseContent.ts",
    rewrites: [["./courses/", "./"]],
  },
  { src: "data/habitCatalog.ts", dest: "lib/max/shared/habitCatalog.ts", rewrites: [] },
  { src: "data/taskStepCatalog.ts", dest: "lib/max/shared/taskStepCatalog.ts", rewrites: [] },
  { src: "lib/toneCopy.ts", dest: "lib/max/shared/toneCopy.ts", rewrites: [] },
];

// Every course module under data/courses/ → lib/max/courses/, each importing a
// sibling courseContent (../courseContent → ./courseContent).
const COURSES_DIR = join(MOBILE, "data/courses");
if (existsSync(COURSES_DIR)) {
  for (const f of readdirSync(COURSES_DIR).filter((n) => n.endsWith(".ts"))) {
    FILES.push({
      src: `data/courses/${f}`,
      dest: `lib/max/courses/${f}`,
      rewrites: [["../courseContent", "./courseContent"]],
    });
  }
}

const results = { synced: [], unchanged: [], skipped: [], missing: [] };

for (const { src, dest, rewrites } of FILES) {
  const srcPath = join(MOBILE, src);
  if (!existsSync(srcPath)) {
    results.missing.push(src);
    continue;
  }
  let body = readFileSync(srcPath, "utf8");
  if (RN_MARKER.test(body)) {
    results.skipped.push({ src, reason: "react-native / asset import" });
    continue;
  }
  for (const [from, to] of rewrites) body = body.split(from).join(to);
  const banner =
    `// AUTO-SYNCED from maxapp:${src} by scripts/sync-from-maxapp.mjs — do not edit here.\n` +
    `// Edit the source in the maxapp repo, then re-run the sync.\n`;
  const out = banner + body;
  const destPath = join(WEB, dest);
  const prev = existsSync(destPath) ? readFileSync(destPath, "utf8") : null;
  if (prev === out) {
    results.unchanged.push(dest);
    continue;
  }
  if (!CHECK) {
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, out);
  }
  results.synced.push(dest);
}

// ── Report ──────────────────────────────────────────────────────────────────
const head = execSync(`git -C "${MAXAPP}" log -1 --format="%h %cd %s" --date=short`, {
  encoding: "utf8",
}).trim();
const branch = execSync(`git -C "${MAXAPP}" rev-parse --abbrev-ref HEAD`, {
  encoding: "utf8",
}).trim();

console.log(`\nsync-from-maxapp  (${CHECK ? "CHECK — no writes" : "WRITE"})`);
console.log(`  source: ${MAXAPP}  [${branch}]  ${head}\n`);
const line = (label, arr, fmt = (x) => x) =>
  arr.length && console.log(`  ${label} (${arr.length}):\n${arr.map((x) => "    " + fmt(x)).join("\n")}`);
line(CHECK ? "WOULD UPDATE" : "SYNCED", results.synced);
line("unchanged", results.unchanged);
line("SKIPPED (needs hand-port)", results.skipped, (x) => `${x.src} — ${x.reason}`);
line("MISSING in maxapp", results.missing);

if (results.skipped.length)
  console.log(
    `\n  note: data/courseIcons.ts uses image require()s (native assets); the web\n` +
      `  supplies its own icon set — that mapping is hand-maintained, not synced.`,
  );
console.log(
  CHECK && results.synced.length
    ? `\n  DRIFT: ${results.synced.length} module(s) differ from maxapp. Run without --check to sync.\n`
    : `\n  done.\n`,
);
process.exit(CHECK && results.synced.length ? 1 : 0);
