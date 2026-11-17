import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cape Town Event Directory — DJs, Sound, Lighting, Photo & Venues",
  description:
    "Browse verified Cape Town DJs, sound engineers, lighting crews, photographers, videographers and venues. Compare starting rates, gear and availability before you book.",
  keywords: site.keywords,
  alternates: { canonical: "/directory" },
  openGraph: {
    title: "Cape Town Event Directory | VibeShift",
    description:
      "Browse verified Cape Town DJs, sound engineers, lighting crews, photographers, videographers and venues by rate, gear and availability.",
    url: "/directory",
    type: "website",
  },
};

export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
