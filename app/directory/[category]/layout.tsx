import type { Metadata } from "next";
import { slugToCategory } from "@/lib/directory-types";

const categoryDescriptions: Record<string, string> = {
  DJs: "Professional Cape Town club, wedding and festival DJs with verified gear, mixes and transparent rates.",
  "Sound Engineers": "FOH and monitor engineers, PA systems, live line-checks and acoustics specialists in Cape Town.",
  Lighting: "Stage lighting rigs, moving heads, architectural uplighting, lasers and DMX controllers in Cape Town.",
  Photographers: "Event photographers capturing live moments, nightlife, weddings and corporate gatherings.",
  Videographers: "Cinema-grade event videographers, aftermovies, recap reels and multi-cam recordings.",
  Venues: "Cape Town event venues, warehouses, rooftops, outdoor lawns and private hire spaces.",
};

function labelFromSlug(slug: string): string {
  const resolved = slugToCategory(slug);
  if (resolved && resolved !== "All") return resolved;
  return slug.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = labelFromSlug(category);
  const description =
    categoryDescriptions[label] ??
    `Browse vetted ${label.toLowerCase()} suppliers in Cape Town, with gear lists, availability and starting rates.`;
  const title = `${label} in Cape Town — Rates, Gear & Availability`;

  return {
    title,
    description,
    alternates: { canonical: `/directory/${category}` },
    openGraph: {
      title: `${title} | VibeShift`,
      description,
      url: `/directory/${category}`,
      type: "website",
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
