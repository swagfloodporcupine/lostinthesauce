// Test that every category filter has a Lucide icon and a valid href
import { categoryFilters } from "../lib/directory-types";
import { categoryIcons, getCategoryHref } from "./category-bar";

categoryFilters.forEach((category) => {
  const Icon = categoryIcons[category];
  if (!Icon) throw new Error(`Missing icon for category: ${category}`);
  const href = getCategoryHref(category);
  if (typeof href !== "string" || href === "") throw new Error(`Invalid href for category: ${category} -> ${href}`);
});

console.log(`All ${categoryFilters.length} category filters have icons and hrefs`);
console.log("ALL TESTS PASSED");