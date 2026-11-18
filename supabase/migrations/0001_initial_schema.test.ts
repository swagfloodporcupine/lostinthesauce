// Test that the vendor_category DB enum covers all 10 consolidated sectors
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "0001_initial_schema.sql"), "utf8");

const EXPECTED_ENUM_VALUES = [
  "dj-and-entertainment",
  "venues-and-accommodation",
  "catering-and-beverages",
  "photography-and-videography",
  "sound-lighting-and-av",
  "staging-and-production",
  "furniture-and-equipment-rentals",
  "decor-and-floristry",
  "event-staffing-and-security",
  "transport-and-logistics",
];

const REMOVED_ENUM_VALUES = [
  "dj", "live_act", "mc", "photographer", "videographer",
  "sound_pa", "sound_engineer", "lighting", "stage_set", "venue",
];

// Verify all new enum values are present
EXPECTED_ENUM_VALUES.forEach((value) => {
  if (!sql.includes(`'${value}'`)) throw new Error(`Missing enum value: '${value}'`);
});

console.log("All 10 new enum values present in migration");

// Verify old enum values are removed
REMOVED_ENUM_VALUES.forEach((value) => {
  if (sql.includes(`'${value}'`)) throw new Error(`Old enum value still present: '${value}'`);
});

console.log("All old enum values removed from migration");
console.log("ALL TESTS PASSED");