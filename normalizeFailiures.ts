// scripts/normalizeFailures.ts
import fs from "fs";
import path from "path";

const UPLOADS_PATH  = path.resolve(__dirname, "./uploads.json");
const FAILURES_PATH = path.resolve(__dirname, "./failures.json");

function loadJson<T>(filePath: string, defaultValue: T): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`⚠️ Could not read ${filePath}, using default.`);
    return defaultValue;
  }
}

function saveJson(filePath: string, data: any) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✔️  Wrote ${filePath}`);
}

function main() {
  // 1. Load current state
  const uploads  = loadJson<Record<string, string>>(UPLOADS_PATH, {});
  const failures = loadJson<string[]>(FAILURES_PATH, []);

  // 2. Filter failures: keep only those not in uploads
  const cleanedFailures = failures.filter(jsonFile => {
    const id = path.basename(jsonFile, ".json");
    if (uploads[id]) {
      console.log(`Removing ${jsonFile} from failures (already uploaded)`);
      return false;
    }
    return true;
  });

  // 3. Save out cleaned failures
  saveJson(FAILURES_PATH, cleanedFailures);

  console.log(`\nSummary:`);
  console.log(` • total uploads:  ${Object.keys(uploads).length}`);
  console.log(` • original failures: ${failures.length}`);
  console.log(` • cleaned failures:  ${cleanedFailures.length}`);
}

main();
