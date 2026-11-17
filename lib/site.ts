export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || "https://vibeshift.co.za");

export const site = {
  name: "VibeShift",
  legalName: "VibeShift",
  tagline: "Cape Town's event crew directory",
  description:
    "Compare Cape Town DJs, sound engineers, lighting crews, photographers, videographers and venues by rate, availability and gear.",
  longDescription:
    "VibeShift is a Cape Town event directory for planners who need DJs, sound engineers, lighting crews, photographers, videographers and venues. Compare starting rates, availability, tech riders and gear before you book.",
  locale: "en-ZA",
  city: "Cape Town",
  region: "Western Cape",
  country: "ZA",
  keywords: [
    "Cape Town DJs",
    "Cape Town event directory",
    "sound engineers Cape Town",
    "event lighting hire Cape Town",
    "event photographers Cape Town",
    "event videographers Cape Town",
    "Cape Town venues for hire",
    "event suppliers Cape Town",
    "party DJ hire Western Cape",
    "wedding production crew Cape Town",
  ],
};

export const organizationId = `${siteUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
