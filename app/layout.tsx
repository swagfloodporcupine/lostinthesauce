import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./reference.css";
import "./marketplace.css";
import "./editorial.css";
import "./responsive-3d.css";
import "./load-intro.css";
import "./motion.css";
import { LoadIntro } from "@/components/load-intro";
import { organizationId, site, siteUrl, websiteId } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Cape Town Event Directory — DJs, Sound, Lighting & Venues`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  category: "Event services",
  classification: "Event planning directory",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: `${site.name} | Cape Town event crew directory`,
    description: site.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Cape Town event crew directory`,
    description: site.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": `ZA-${site.region === "Western Cape" ? "WC" : "WC"}`,
    "geo.placename": site.city,
    "geo.position": "-33.9249;18.4241",
    ICBM: "-33.9249, 18.4241",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#ffffff",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": organizationId,
      name: site.name,
      alternateName: site.legalName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`,
        width: 32,
        height: 32,
      },
      description: site.longDescription,
      areaServed: {
        "@type": "AdministrativeArea",
        name: `${site.city}, ${site.region}`,
      },
      knowsAbout: ["Event DJs", "Live sound engineering", "Event lighting", "Event photography", "Event videography", "Venue hire"],
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: site.name,
      description: site.description,
      inLanguage: site.locale,
      publisher: { "@id": organizationId },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${site.name} | Cape Town event crew directory`,
      description: site.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      inLanguage: site.locale,
    },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          // Static, build-time structured data for rich results.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <LoadIntro />
        {children}
      </body>
    </html>
  );
}
