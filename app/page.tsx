import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { LiveListing } from "@/lib/directory-types";
import { site } from "@/lib/site";
import HomeMarketplace from "./marketplace-home";

export const metadata: Metadata = {
  title: {
    absolute: `${site.name} | Cape Town Event Directory — DJs, Sound, Lighting & Venues`,
  },
  description:
    "Compare Cape Town DJs, sound engineers, lighting crews, photographers, videographers and venues by starting rate, availability and gear. Build one crew for your next event.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: `${site.name} | Cape Town event crew directory`,
    description:
      "Compare Cape Town DJs, sound engineers, lighting crews, photographers, videographers and venues by starting rate, availability and gear.",
  },
};

export const dynamic = "force-dynamic";
export default async function HomePage() {
  let liveListings: LiveListing[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("vendor_listings").select("id,profile_id,slug,title,category,city,rate_from,rate_to,cover_image_url,verified_at").eq("published", true).order("created_at", { ascending: false }).limit(12);
    if (!error) {
      const profileIds = [...new Set((data ?? []).map((listing: { profile_id: string }) => listing.profile_id))];
      const { data: profiles } = profileIds.length
        ? await supabase.from("public_vendor_profiles").select("id,display_name,avatar_url").in("id", profileIds)
        : { data: [] };
      const profilesById = new Map<string, { display_name: string | null; avatar_url: string | null }>();
      for (const profile of profiles ?? []) profilesById.set(profile.id, profile);
      liveListings = (data ?? []).map((listing: {
        id: string;
        profile_id: string;
        slug: string;
        title: string;
        category: string;
        city: string | null;
        rate_from: number | null;
        rate_to: number | null;
        cover_image_url: string | null;
        verified_at: string | null;
      }) => {
        const profile = profilesById.get(listing.profile_id);
        return {
          id: listing.id,
          slug: listing.slug,
          title: listing.title,
          category: listing.category,
          city: listing.city,
          rateFrom: listing.rate_from,
          rateTo: listing.rate_to,
          coverImageUrl: listing.cover_image_url,
          displayName: profile?.display_name ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          verifiedAt: listing.verified_at,
        };
      });
    }
  } catch { /* Local setup can be previewed before Supabase credentials are added. */ }
  return <HomeMarketplace liveListings={liveListings} />;
}
