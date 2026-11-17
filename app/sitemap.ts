import type { MetadataRoute } from "next";
import { categoryToSlug, listingCategories } from "@/lib/directory-types";
import { sampleListings } from "@/lib/mock-listings";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/directory`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/join`, lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = listingCategories.map((category) => ({
    url: `${siteUrl}/directory/${categoryToSlug(category)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const vendorRoutes: MetadataRoute.Sitemap = sampleListings
    .filter((listing) => Boolean(listing.slug))
    .map((listing) => ({
      url: `${siteUrl}/vendors/${listing.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...categoryRoutes, ...vendorRoutes];
}
