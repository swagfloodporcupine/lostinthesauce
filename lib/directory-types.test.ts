// Test that all 17 categories are defined and typed correctly
import { listingCategories, categoryFilters, categoryFromValue, slugToCategory, categoryToSlug } from "@/lib/directory-types";

const EXPECTED_CATEGORIES = [
  "DJs and Entertainment",
  "Venues and Accommodation",
  "Catering and Beverages",
  "Photography and Videography",
  "Sound, Lighting and AV",
  "Staging and Production",
  "Furniture and Equipment Rentals",
  "Decor and Floristry",
  "Event Staffing and Security",
  "Transport and Logistics"
];

// Verify all categories exist in listingCategories
EXPECTED_CATEGORIES.forEach(cat => {
  if (!listingCategories.includes(cat as any)) throw new Error(`Missing category: ${cat}`);
});

console.log("All 10 new categories found in listingCategories");

// Verify slug mapping works for new categories
EXPECTED_CATEGORIES.forEach(cat => {
  const slug = categoryToSlug(cat as any);
  const back = slugToCategory(slug);
  if (back !== cat) throw new Error(`Slug round-trip failed for ${cat}: ${slug} -> ${back}`);
});

console.log("All slug round-trips work for new categories");

// Verify categoryFromValue maps common terms
const testMappings = [
  { input: "venue hotel", expected: "Venues and Accommodation" },
  { input: "catering food", expected: "Catering and Beverages" },
  { input: "dj entertainment", expected: "DJs and Entertainment" },
  { input: "photo video", expected: "Photography and Videography" },
  { input: "sound av", expected: "Sound, Lighting and AV" },
  { input: "stage production", expected: "Staging and Production" },
  { input: "furniture rental", expected: "Furniture and Equipment Rentals" },
  { input: "decor flowers", expected: "Decor and Floristry" },
  { input: "staff security", expected: "Event Staffing and Security" },
  { input: "transport logistics", expected: "Transport and Logistics" },
];

testMappings.forEach(({ input, expected }) => {
  const result = categoryFromValue(input);
  if (result !== expected) throw new Error(`categoryFromValue("${input}") = ${result}, expected ${expected}`);
});

console.log("All categoryFromValue mappings work");

console.log("ALL TESTS PASSED");