export const listingCategories = [
  "DJs and Entertainment",
  "Venues and Accommodation",
  "Catering and Beverages",
  "Photography and Videography",
  "Sound, Lighting and AV",
  "Staging and Production",
  "Furniture and Equipment Rentals",
  "Decor and Floristry",
  "Event Staffing and Security",
  "Transport and Logistics",
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
  if (["dj", "live act", "mc", "music", "entertainment", "entertainment"].some((term) => category.includes(term))) return "DJs and Entertainment";
  if (["venue", "space", "hotel", "accommodation", "lodging", "accommodation"].some((term) => category.includes(term))) return "Venues and Accommodation";
  if (["cater", "food", "drink", "beverage", "bar", "buffet"].some((term) => category.includes(term))) return "Catering and Beverages";
  if (category.includes("photo") || category.includes("video") || category.includes("film")) return "Photography and Videography";
  if (["sound", "audio", "pa", "av", "acoustic"].some((term) => category.includes(term))) return "Sound, Lighting and AV";
  if (["light", "stage", "set", "production", "staging"].some((term) => category.includes(term))) return "Staging and Production";
  if (["furniture", "furnish", "rental", "equip", "table", "chair"].some((term) => category.includes(term))) return "Furniture and Equipment Rentals";
  if (["decor", "flower", "floral", "decoration", "styling"].some((term) => category.includes(term))) return "Decor and Floristry";
  if (["staff", "security", "crew", "waiter", "server", "guard"].some((term) => category.includes(term))) return "Event Staffing and Security";
  if (["transport", "logistic", "travel", "transfer", "shuttle", "car"].some((term) => category.includes(term))) return "Transport and Logistics";
  return null;
}

export function formatZar(amount: number): string {
  return `R${amount.toLocaleString("en-US")}`;
}

export function categoryToSlug(category: CategoryFilter): string {
  if (category === "All") return "";
  return category.toLowerCase().replace(/\s+/g, "-").replace(/,/g, "");
}

export function slugToCategory(slug: string): CategoryFilter | null {
  const normalized = slug.toLowerCase().trim();
  if (!normalized || normalized === "all") return "All";
  if (normalized === "djs" || normalized === "djs-and-entertainment") return "DJs and Entertainment";
  if (normalized === "venues-and-accommodation" || normalized === "venues" || normalized === "venues-and-spaces") return "Venues and Accommodation";
  if (normalized === "catering-and-beverages" || normalized === "catering") return "Catering and Beverages";
  if (normalized === "photography-and-videography" || normalized === "photographers" || normalized === "videographers" || normalized === "photography-and-video") return "Photography and Videography";
  if (normalized === "sound-lighting-and-av" || normalized === "sound-engineers" || normalized === "lighting" || normalized === "sound-and-lighting") return "Sound, Lighting and AV";
  if (normalized === "staging-and-production" || normalized === "stage" || normalized === "production") return "Staging and Production";
  if (normalized === "furniture-and-equipment-rentals" || normalized === "furniture-rental" || normalized === "equipment-rental") return "Furniture and Equipment Rentals";
  if (normalized === "decor-and-floristry" || normalized === "decor" || normalized === "floristry") return "Decor and Floristry";
  if (normalized === "event-staffing-and-security" || normalized === "event-crews" || normalized === "staffing" || normalized === "security") return "Event Staffing and Security";
  if (normalized === "transport-and-logistics" || normalized === "transport" || normalized === "logistics") return "Transport and Logistics";
  return null;
}