import { z } from "zod";

// ─── Dream Profile ──────────────────────────────────────────

export const dreamProfileSchema = z.object({
  dreamStatement: z
    .string()
    .min(20, "Dream statement must be at least 20 characters")
    .max(1000, "Dream statement must be under 1,000 characters"),
  intent: z.enum(["lead", "join", "partner", "explore"]).optional(),
  skillsOffered: z
    .array(z.string())
    .min(1, "Select at least 1 skill you offer")
    .max(10, "Maximum 10 skills"),
  skillsNeeded: z
    .array(z.string())
    .min(1, "Select at least 1 skill you need")
    .max(10, "Maximum 10 skills"),
  workStyle: z
    .object({
      ideation: z.number().min(0).max(100),
      execution: z.number().min(0).max(100),
      people: z.number().min(0).max(100),
      thinking: z.number().min(0).max(100),
      action: z.number().min(0).max(100),
    })
    .optional(),
  location: z.object({
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
  }),
  preferences: z
    .object({
      remotePreference: z.enum(["remote", "local", "hybrid"]),
      timezone: z.string(),
      industryInterests: z.array(z.string()).max(5),
      techPreference: z.enum(["technical", "non-technical", "both"]),
    })
    .optional(),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must be under 500 characters"),
});

export type DreamProfileInput = z.infer<typeof dreamProfileSchema>;

// ─── Match Actions ──────────────────────────────────────────

export const expressInterestSchema = z.object({
  matchId: z.string().min(1),
});

export const matchActionSchema = z.object({
  matchId: z.string().min(1),
  action: z.enum(["accept", "decline"]),
});

// ─── Messages ───────────────────────────────────────────────

export const sendMessageSchema = z.object({
  matchId: z.string().min(1),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be under 2,000 characters"),
});

// ─── Discover Filters ───────────────────────────────────────

export const discoverFiltersSchema = z.object({
  search: z.string().optional(),
  dreamCategory: z.string().optional(),
  minMatchScore: z.number().min(0).max(100).optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  commitmentLevel: z.string().optional(),
  experienceLevel: z.string().optional(),
  remotePreference: z.enum(["remote", "local", "hybrid"]).optional(),
  savedFilterId: z.string().optional(),
});

export type DiscoverFilters = z.infer<typeof discoverFiltersSchema>;
