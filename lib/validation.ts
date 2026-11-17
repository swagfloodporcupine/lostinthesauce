import { z } from "zod";
export const vendorListingSchema = z.object({
  title: z.string().trim().min(3).max(100),
  category: z.enum(["dj", "live_act", "mc", "photographer", "videographer", "sound_pa", "sound_engineer", "lighting", "stage_set", "venue"]),
  description: z.string().trim().min(30).max(3000),
  city: z.string().trim().min(2).max(80),
  rate_from: z.number().int().nonnegative().nullable(),
  rate_to: z.number().int().nonnegative().nullable()
}).refine(v => v.rate_from === null || v.rate_to === null || v.rate_to >= v.rate_from, { path:["rate_to"], message:"Maximum rate must be greater than or equal to the minimum rate." });
