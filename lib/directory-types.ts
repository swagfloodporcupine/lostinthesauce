export const listingCategories = [
  "DJs",
  "Sound Engineers",
  "Lighting",
  "Photographers",
  "Videographers",
  "Venues",
] as const;

export const categoryFilters = ["All", ...listingCategories] as const;

export type ListingCategory = (typeof listingCategories)[number];
export type CategoryFilter = (typeof categoryFilters)[number];
export type PriceRange = "any" | "under-2500" | "2500-5000" | "5000-15000" | "over-15000";

export type PortfolioItem = {
  id: string;
  image: string;
  alt: string;
  type: "image" | "video";
};

export type ClientReview = {
  id: string;
  name: string;
  clientType: string;
  date: string;
  rating: number;
  comment: string;
};

export type TechRiderItem = {
  id: string;
  label: string;
  required: boolean;
};

export type VendorListing = {
  id: string;
  slug?: string;
  name: string;
  category: ListingCategory;
  area: string;
  region: string;
  locationCode: "CT" | "WC";
  bio: string;
  summary: string;
  tags: string[];
  gear: string[];
  rateFrom: number | null;
  rateTo: number | null;
  rateUnit: string;
  image: string;
  avatarImage: string | null;
  verified?: boolean;
  rating: number | null;
  reviewCount: number;
  unavailableDates: string[];
  portfolio: PortfolioItem[];
  mixTitle: string | null;
  techRider: TechRiderItem[];
  reviews: ClientReview[];
  sample: boolean;
  instagram: string | null;
  soundcloud: string | null;
};

export type LiveListing = {
  id: string;
  slug: string;
  title: string;
  category: string;
  city: string | null;
  rateFrom: number | null;
  rateTo: number | null;
  coverImageUrl: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  verifiedAt: string | null;
};

export function categoryFromValue(value: string): ListingCategory | null {
  const category = value.toLowerCase().replaceAll("_", " ");
  if (["dj", "live act", "mc", "music"].some((term) => category.includes(term))) return "DJs";
  if (["sound", "audio", "pa"].some((term) => category.includes(term))) return "Sound Engineers";
  if (["light", "stage", "set"].some((term) => category.includes(term))) return "Lighting";
  if (category.includes("photo") && !category.includes("video")) return "Photographers";
  if (category.includes("video")) return "Videographers";
  if (category.includes("venue") || category.includes("space")) return "Venues";
  return null;
}

export function formatZar(amount: number): string {
  return `R${amount.toLocaleString("en-US")}`;
}

export function categoryToSlug(category: CategoryFilter): string {
  if (category === "All") return "";
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCategory(slug: string): CategoryFilter | null {
  const normalized = slug.toLowerCase().trim();
  if (!normalized || normalized === "all") return "All";
  if (normalized === "djs" || normalized === "djs-&-selectors") return "DJs";
  if (normalized === "sound-engineers") return "Sound Engineers";
  if (normalized === "lighting" || normalized === "lighting-&-staging") return "Lighting";
  if (normalized === "photographers") return "Photographers";
  if (normalized === "videographers") return "Videographers";
  if (normalized === "venues" || normalized === "venues-&-spaces") return "Venues";
  return null;
}