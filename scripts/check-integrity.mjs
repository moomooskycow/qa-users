import Ajv from "ajv/dist/2020.js";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runFingerprintFixtures } from "./fingerprint-fixtures.mjs";
import { runInputSemanticFixtures } from "./input-semantic-fixtures.mjs";
import { runOutputSemanticFixtures } from "./output-semantic-fixtures.mjs";
import { runResolverFixtures } from "./resolver-fixtures.mjs";
import { runSchemaIntegrity } from "./schema-integrity.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`qa-users integrity: FAIL ${message}`);
  process.exitCode = 1;
}

function requireFile(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path) || !statSync(path).isFile()) fail(`missing file ${relativePath}`);
  return path;
}

function readJson(relativePath) {
  const path = requireFile(relativePath);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`qa-users integrity: FAIL invalid JSON ${relativePath}: ${reason}`, { cause: error });
  }
}

const packageJson = readJson("package.json");
if (packageJson.name !== "@misty-step/qa-users") fail("package name drifted");
if (packageJson.license !== "MIT") fail("package license is not MIT");
if (existsSync(join(root, "adapters"))) fail("obsolete root adapters directory remains");

for (const relativePath of [
  "skills/qa-users/SKILL.md",
  "skills/qa-users/references/lifecycle.md",
  "skills/qa-users/references/safety.md",
  "skills/qa-users/references/tracker.md",
  "skills/qa-users/references/input-semantic.mjs",
  "skills/qa-users/references/input-semantic-fixtures.json",
  "skills/qa-users/references/semantic-utils.mjs",
  "skills/qa-users/references/output-semantic.mjs",
  "skills/qa-users/references/output-semantic-fixtures.json",
  "skills/qa-users/references/finding-fingerprint.mjs",
  "skills/qa-users/references/finding-fingerprint-fixtures.json",
  "skills/qa-users/references/execution-resolver.mjs",
  "skills/qa-users/references/execution-validation.mjs",
  "skills/qa-users/references/execution-resolver-fixtures.json",
  "skills/qa-users/references/threshold.mjs",
  "skills/qa-users/references/execution-overrides.md",
  "skills/qa-users/references/schema-fixtures.json",
  "skills/qa-users/references/adapters/omp.md",
  "skills/qa-users/references/adapters/nen.md",
  "scripts/integrity-helpers.mjs",
  "scripts/schema-integrity.mjs",
  "scripts/input-semantic-fixtures.mjs",
  "scripts/resolver-fixtures.mjs",
  "scripts/output-semantic-fixtures.mjs",
  "scripts/fingerprint-fixtures.mjs",
]) requireFile(relativePath);

const schemaFiles = new Map([
  ["input", readJson("skills/qa-users/references/input.schema.json")],
  ["persona", readJson("skills/qa-users/references/persona.schema.json")],
  ["tracker", readJson("skills/qa-users/references/tracker.schema.json")],
  ["execution", readJson("skills/qa-users/references/execution.schema.json")],
  ["output", readJson("skills/qa-users/references/output.schema.json")],
]);
const ajv = new Ajv({ allErrors: true, strict: true });
for (const schema of schemaFiles.values()) ajv.addSchema(schema);
const validateInputSchema = ajv.getSchema(schemaFiles.get("input").$id);
const validateOutputSchema = ajv.getSchema(schemaFiles.get("output").$id);
const schemaFixtures = readJson("skills/qa-users/references/schema-fixtures.json");

const { semanticResult } = runSchemaIntegrity({
  schemaFixtures,
  validateInputSchema,
  validateOutputSchema,
  ajv,
  fail,
});
runInputSemanticFixtures({ readJson, baseInput: schemaFixtures.input, fail });
runResolverFixtures({ readJson, baseInput: schemaFixtures.input, fail });
runOutputSemanticFixtures({ readJson, fail });
runFingerprintFixtures({ readJson, fail });

if (!semanticResult.execution_overrides?.provenance) fail("semantic result omitted execution override provenance");
if (process.exitCode) process.exit();
console.log("qa-users integrity: PASS");
