# Expand Supplier Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand VibeShift's supplier categories from 7 to 17 to cover the full South African events industry, updating database models, filtering, icons, marketplace navigation, and seeding representative SA vendors for each new category.

**Architecture:** This is a data-driven expansion following the existing patterns in `lib/directory-types.ts`, `components/category-bar.tsx`, `components/directory-filters.tsx`, `app/directory/[category]/page.tsx`, and `lib/mock-listings.ts`. The database enum in `supabase/migrations/0001_initial_schema.sql` must be updated to match the new categories. All changes follow the existing TypeScript/Next.js/Tailwind patterns with Supabase backend.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS 4, React 19, Supabase (PostgreSQL), Lucide React icons.

**Spec:** User request to add 10 new categories: Venues and accommodation, Catering and beverages, DJs and entertainment, Photography and videography, Sound, lighting and AV, Staging and production, Furniture and equipment rentals, Decor and floristry, Event staffing and security, Transport and logistics.

## Global Constraints

- Currency is South African Rands; use `formatZar()` from `lib/directory-types` for display.
- Vendor listing categories are typed in `lib/directory-types.ts` (`listingCategories`) and mirrored in the `vendor_category` DB enum; keep them in sync.
- Project root is `C:\Users\samue\Downloads\vibeshift-fullstack\vibeshift-fullstack`.
- Dark-mode DM Sans aesthetic with cyan accent color.
- All new categories must have representative South African sample vendors with realistic data.

## Review Focus

1. **Database enum mismatch** — If `vendor_category` enum in DB doesn't match `listingCategories` in TypeScript, vendor listings will fail to insert or query.
2. **Slug/category mapping broken** — If `slugToCategory` and `categoryToSlug` don't handle new categories, category pages return 404 or empty results.
3. **Missing icons** — If `categoryIcons` in `category-bar.tsx` lacks entries for new categories, the category bar will crash with "Icon is not a constructor" errors.
4. **Filtering returns no results** — If `categoryFromValue` doesn't map new category terms, search/filter won't find listings.
5. **Sample vendors not showing** — If mock listings don't use exact category strings from `listingCategories`, they won't appear in filtered views.

---

### Task 1: Update TypeScript Category Definitions

**Files:**
- Modify: `lib/directory-types.ts`

**Interfaces:**
- Consumes: None (foundational task)
- Produces: Updated `listingCategories`, `categoryFilters`, `ListingCategory`, `CategoryFilter` types; updated `categoryFromValue`, `categoryToSlug`, `slugToCategory` functions

- [ ] **Step 1: Write the failing test**

```typescript
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

// Verify slug mapping works for new categories
EXPECTED_CATEGORIES.forEach(cat => {
  const slug = categoryToSlug(cat as any);
  const back = slugToCategory(slug);
  if (back !== cat) throw new Error(`Slug round-trip failed for ${cat}: ${slug} -> ${back}`);
});

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test lib/directory-types.test.ts` (or similar test runner)
Expected: FAIL with missing categories and mapping errors

- [ ] **Step 3: Implement updated `lib/directory-types.ts`**

Update `listingCategories` array to include all 17 categories (7 existing + 10 new):
1. DJs and Entertainment
2. Venues and Accommodation
3. Catering and Beverages
4. Photography and Videography
5. Sound, Lighting and AV
6. Staging and Production
7. Furniture and Equipment Rentals
8. Decor and Floristry
9. Event Staffing and Security
10. Transport and Logistics
Plus keep existing: Photographers, Videographers, Venues, Lighting, Sound Engineers, DJs (these will be consolidated)

Update `categoryFilters` to include "All" + all 17 categories.

Update `categoryFromValue` function with new mapping logic for all 17 categories.

Update `categoryToSlug` and `slugToCategory` with new slug mappings (kebab-case).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test lib/directory-types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/directory-types.ts
git commit -m "feat: expand listingCategories to 17 event industry sectors"
```

---

### Task 2: Update Database Migration Schema

**Files:**
- Modify: `supabase/migrations/0001_initial_schema.sql`

**Interfaces:**
- Consumes: Updated `listingCategories` from Task 1
- Produces: Updated `vendor_category` enum in PostgreSQL

- [ ] **Step 1: Write the failing test**

```sql
-- Test that vendor_category enum contains all 17 categories
DO $$
DECLARE
  expected_categories TEXT[] := ARRAY[
    'dj_entertainment',
    'venues_accommodation',
    'catering_beverages', 
    'photography_videography',
    'sound_lighting_av',
    'staging_production',
    'furniture_equipment_rentals',
    'decor_floristry',
    'event_staffing_security',
    'transport_logistics',
    -- Legacy categories (to be consolidated)
    'dj', 'live_act', 'mc', 'photographer', 'videographer', 
    'sound_pa', 'sound_engineer', 'lighting', 'stage_set', 'venue'
  ];
  actual_categories TEXT[];
  missing TEXT[];
BEGIN
  SELECT array_agg(enumlabel ORDER BY enumlabel) INTO actual_categories
  FROM pg_enum
  WHERE enumtypid = 'public.vendor_category'::regtype;
  
  missing := expected_categories - actual_categories;
  IF array_length(missing, 1) > 0 THEN
    RAISE EXCEPTION 'Missing enum values: %', missing;
  END IF;
  RAISE NOTICE 'All % categories present in vendor_category enum', array_length(actual_categories, 1);
END $$;
```

- [ ] **Step 2: Run test to verify it fails**

Run against local Supabase: `supabase db reset` then run test SQL
Expected: FAIL with missing enum values

- [ ] **Step 3: Implement updated `supabase/migrations/0001_initial_schema.sql`**

Replace the `vendor_category` enum definition (line 4) with new enum containing all 17 categories in snake_case:
- `dj_entertainment`
- `venues_accommodation`
- `catering_beverages`
- `photography_videography`
- `sound_lighting_av`
- `staging_production`
- `furniture_equipment_rentals`
- `decor_floristry`
- `event_staffing_security`
- `transport_logistics`

Note: Since this is the initial migration, we can replace it directly. If there were existing migrations, we'd need a new migration file.

- [ ] **Step 4: Run test to verify it passes**

Run: `supabase db reset` then run test SQL
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_initial_schema.sql
git commit -m "feat: update vendor_category enum to 17 event industry sectors"
```

---

### Task 3: Update Category Bar Icons and Navigation

**Files:**
- Modify: `components/category-bar.tsx`

**Interfaces:**
- Consumes: Updated `categoryFilters`, `categoryToSlug`, `CategoryFilter` from Task 1
- Produces: Updated `categoryIcons` record with Lucide icons for all 17 categories

- [ ] **Step 1: Write the failing test**

```typescript
// Test that all 17 categories have icons and hrefs
import { categoryIcons, getCategoryHref, categoryFilters } from "@/components/category-bar";

categoryFilters.forEach(category => {
  if (category === "All") return;
  if (!categoryIcons[category]) throw new Error(`Missing icon for category: ${category}`);
  const href = getCategoryHref(category);
  if (!href.startsWith("/directory/")) throw new Error(`Invalid href for ${category}: ${href}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run test
Expected: FAIL with missing icons for new categories

- [ ] **Step 3: Implement updated `components/category-bar.tsx`**

Add Lucide React icons for all 10 new categories in `categoryIcons` record:
- "DJs and Entertainment" → Music2 (or new icon)
- "Venues and Accommodation" → Building2 (or Home/Building)
- "Catering and Beverages" → Utensils/Coffee
- "Photography and Videography" → Camera (or Video)
- "Sound, Lighting and AV" → Volume2/Music
- "Staging and Production" → Box/Layout
- "Furniture and Equipment Rentals" → Package/Box
- "Decor and Floristry" → Sparkles/Flower
- "Event Staffing and Security" → Users/Shield
- "Transport and Logistics" → Truck/Navigation

Import new icons from lucide-react as needed.

- [ ] **Step 4: Run test to verify it passes**

Run test
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/category-bar.tsx
git commit -m "feat: add Lucide icons for 10 new supplier categories in category bar"
```

---

### Task 4: Update Directory Page Category Cards

**Files:**
- Modify: `app/directory/page.tsx`

**Interfaces:**
- Consumes: Updated `listingCategories` from Task 1, updated `categoryIcons` from Task 3
- Produces: Updated `categoryMeta` object with metadata for all 17 categories

- [ ] **Step 1: Write the failing test**

```typescript
// Test that categoryMeta has entries for all 17 categories with correct structure
import { categoryMeta } from "@/app/directory/page";
import { listingCategories } from "@/lib/directory-types";

listingCategories.forEach(category => {
  const meta = categoryMeta[category];
  if (!meta) throw new Error(`Missing categoryMeta for: ${category}`);
  if (!meta.icon) throw new Error(`Missing icon for: ${category}`);
  if (typeof meta.count !== 'number') throw new Error(`Invalid count for: ${category}`);
  if (!meta.desc || !meta.slug) throw new Error(`Missing desc/slug for: ${category}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run test
Expected: FAIL with missing categoryMeta entries

- [ ] **Step 3: Implement updated `app/directory/page.tsx`**

Expand `categoryMeta` object with entries for all 10 new categories:
- Each needs: icon (from Lucide), count (from sampleListings filter), desc (short description), slug (kebab-case)

Also update the imports to include new Lucide icons.

- [ ] **Step 4: Run test to verify it passes**

Run test
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/directory/page.tsx
git commit -m "feat: add category cards for 10 new supplier categories on directory page"
```

---

### Task 5: Update Category Page Descriptions and Filtering

**Files:**
- Modify: `app/directory/[category]/page.tsx`

**Interfaces:**
- Consumes: Updated `slugToCategory`, `CATEGORY_DESCRIPTIONS` from Task 1
- Produces: Updated `CATEGORY_DESCRIPTIONS` record and filtering logic for all 17 categories

- [ ] **Step 1: Write the failing test**

```typescript
// Test that CATEGORY_DESCRIPTIONS has entries for all 17 categories
import { CATEGORY_DESCRIPTIONS } from "@/app/directory/[category]/page";
import { listingCategories } from "@/lib/directory-types";

listingCategories.forEach(category => {
  if (!CATEGORY_DESCRIPTIONS[category]) throw new Error(`Missing description for: ${category}`);
});

// Test filtering logic handles new categories correctly
const { slugToCategory } = await import("@/lib/directory-types");
const testSlugs = [
  "djs-and-entertainment",
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

testSlugs.forEach(slug => {
  const cat = slugToCategory(slug);
  if (!cat || cat === "All") throw new Error(`slugToCategory("${slug}") failed: ${cat}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run test
Expected: FAIL with missing descriptions and slug mapping

- [ ] **Step 3: Implement updated `app/directory/[category]/page.tsx`**

Add entries to `CATEGORY_DESCRIPTIONS` for all 10 new categories with compelling marketing copy.

Ensure filtering logic at lines 39-48 handles the new consolidated categories correctly (the existing logic checks `l.category.toLowerCase() === targetCategory.toLowerCase()` which should work if mock data uses exact category strings).

- [ ] **Step 4: Run test to verify it passes**

Run test
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/directory/[category]/page.tsx
git commit -m "feat: add descriptions and fix filtering for 10 new supplier categories"
```

---

### Task 6: Seed Sample Vendors for All 17 Categories

**Files:**
- Modify: `lib/mock-listings.ts`

**Interfaces:**
- Consumes: Updated `VendorListing` type and `ListingCategory` from Task 1
- Produces: Expanded `sampleListings` array with 2-3 vendors per category (34-51 total)

- [ ] **Step 1: Write the failing test**

```typescript
// Test that sampleListings has at least 2 vendors per category
import { sampleListings } from "@/lib/mock-listings";
import { listingCategories } from "@/lib/directory-types";

const counts: Record<string, number> = {};
sampleListings.forEach(l => {
  counts[l.category] = (counts[l.category] || 0) + 1;
});

listingCategories.forEach(category => {
  const count = counts[category] || 0;
  if (count < 2) throw new Error(`Category "${category}" has only ${count} vendors, need at least 2`);
});

// Verify all listings use valid categories
sampleListings.forEach(l => {
  if (!listingCategories.includes(l.category as any)) {
    throw new Error(`Listing "${l.name}" uses invalid category: ${l.category}`);
  }
});

// Verify South African context
sampleListings.forEach(l => {
  if (!l.region.includes("ZA") && !l.region.includes("South Africa")) {
    throw new Error(`Listing "${l.name}" missing SA region context: ${l.region}`);
  }
  if (l.rateFrom !== null && l.rateFrom < 500) {
    throw new Error(`Listing "${l.name}" rate too low for SA market: R${l.rateFrom}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run test
Expected: FAIL with insufficient vendors per category

- [ ] **Step 3: Implement updated `lib/mock-listings.ts`**

Add 2-3 representative South African vendors for each of the 10 new categories:

**1. DJs and Entertainment** (consolidate existing DJs + add live acts/MCs)
- Keep existing 2 DJ samples, add 1 live band/MC

**2. Venues and Accommodation** (expand existing Venues)
- Keep existing 2 venues, add 1 hotel/accommodation venue

**3. Catering and Beverages** (NEW - 3 vendors)
- Cape Town catering company (weddings/corporate)
- Winelands mobile bar service
- Township food experience caterer

**4. Photography and Videography** (consolidate existing Photographers + Videographers)
- Keep existing 2 photographers + 2 videographers = 4 total

**5. Sound, Lighting and AV** (consolidate Sound Engineers + Lighting)
- Keep existing 2 sound + 2 lighting = 4 total

**6. Staging and Production** (NEW - 3 vendors)
- Stage build company (CT)
- Production management (JHB)
- Rigging/truss specialist (WC)

**7. Furniture and Equipment Rentals** (NEW - 3 vendors)
- Event furniture hire (CT)
- AV equipment rental (JHB)
- Marquee/tent hire (WC)

**8. Decor and Floristry** (NEW - 3 vendors)
- Luxury florist (CT)
- Event styling/decor (JHB)
- Indigenous floral designer (WC)

**9. Event Staffing and Security** (NEW - 3 vendors)
- Event staffing agency (CT)
- Security company (JHB)
- VIP protection/ushers (WC)

**10. Transport and Logistics** (NEW - 3 vendors)
- Luxury shuttle service (CT)
- Equipment logistics (JHB)
- Guest transport (WC)

Each vendor needs: realistic SA names, areas (Sea Point, Woodstock, Observatory, Stellenbosch, Paarl, Franschhoek, Johannesburg, Sandton, Pretoria, Durban, etc.), ZAR rates, Unsplash images, gear/tags relevant to category.

- [ ] **Step 4: Run test to verify it passes**

Run test
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/mock-listings.ts
git commit -m "feat: seed 34 representative SA vendors across 17 event categories"
```

---

### Task 7: Verify Filtering and Browsing Works End-to-End

**Files:**
- Test: Manual verification via dev server

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working application

- [ ] **Step 1: Start dev server**

```bash
cd "C:\Users\samue\Downloads\vibeshift-fullstack\vibeshift-fullstack"
npm run dev
```

- [ ] **Step 2: Verify directory page loads with all 17 category cards**

Navigate to `http://localhost:3000/directory`
- All 17 category cards visible with icons, counts, descriptions
- Category chips in CategoryBar show all 17 + All
- Click each category card → navigates to correct category page

- [ ] **Step 3: Verify each category page filters correctly**

For each of the 17 categories:
- Navigate to `/directory/[slug]`
- Verify page title shows category name
- Verify listings shown match the category (count > 0)
- Verify description text is appropriate
- Verify CategoryBar highlights active category

- [ ] **Step 4: Verify "All" category shows all listings**

Navigate to `/directory`
- All sample listings visible (34+)
- Filter by price range, gear, date works

- [ ] **Step 5: Verify no console errors or TypeScript errors**

Check browser console for errors
Run `npm run build` to verify production build succeeds

- [ ] **Step 6: Commit verification**

```bash
git commit -m "test: verify all 17 categories filter and browse correctly"
```

---

### Task 8: Update Documentation

**Files:**
- Modify: `CLAUDE.md` (if needed to reflect new category count)
- Create: `docs/superpowers/specs/2026-11-18-expand-supplier-categories-design.md` (design doc)

**Interfaces:**
- Consumes: All implementation decisions
- Produces: Updated documentation

- [ ] **Step 1: Update CLAUDE.md**

Update line 23 in CLAUDE.md to reflect 17 categories instead of 7.

- [ ] **Step 2: Create design doc**

Write short design document covering:
- Intent and why (comprehensive SA events marketplace)
- Category taxonomy (17 categories with rationale)
- Data model changes (enum, types)
- UI/UX changes (icons, navigation, filtering)
- Sample data strategy (SA vendors, realistic rates)

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md docs/superpowers/specs/2026-11-18-expand-supplier-categories-design.md
git commit -m "docs: update CLAUDE.md and add design doc for 17-category expansion"
```

---

## Summary

This plan expands VibeShift from 7 to 17 supplier categories through 8 focused tasks:

1. **TypeScript types** - Core category definitions and mapping functions
2. **Database enum** - PostgreSQL vendor_category enum sync
3. **Category bar** - Icons and navigation for all categories
4. **Directory page** - Category overview cards with metadata
5. **Category pages** - Descriptions and filtering logic
6. **Sample data** - 34+ realistic SA vendors across all categories
7. **E2E verification** - Manual testing of all browsing/filtering flows
8. **Documentation** - Updated CLAUDE.md and design spec

Each task is independently testable and follows the existing codebase patterns. The consolidated categories (DJs+Entertainment, Venues+Accommodation, etc.) reduce fragmentation while the new categories fill coverage gaps for a complete events marketplace.