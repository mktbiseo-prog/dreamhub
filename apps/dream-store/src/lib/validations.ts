import { z } from "zod";

export const milestoneSchema = z.object({
  title: z
    .string()
    .min(1, "Milestone title is required")
    .max(100, "Milestone title must be 100 characters or less"),
  targetDate: z.string().min(1, "Target date is required"),
});

export const createDreamStorySchema = z.object({
  title: z
    .string()
    .min(1, "Dream title is required")
    .max(120, "Dream title must be 120 characters or less"),
  statement: z
    .string()
    .min(10, "Dream statement must be at least 10 characters")
    .max(2000, "Dream statement must be 2000 characters or less"),
  originStory: z
    .string()
    .max(3000, "Origin story must be 3000 characters or less")
    .optional()
    .or(z.literal("")),
  impactStatement: z
    .string()
    .max(1000, "Impact statement must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  creatorStage: z
    .string()
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  processImages: z.array(z.string()).optional().default([]),
  status: z
    .enum(["ACTIVE", "PREVIEW"])
    .optional()
    .default("ACTIVE"),
  milestones: z
    .array(milestoneSchema)
    .length(3, "Please add exactly 3 milestones"),
});

export const updateDreamStorySchema = createDreamStorySchema;

export type CreateDreamStoryInput = z.infer<typeof createDreamStorySchema>;
export type UpdateDreamStoryInput = z.infer<typeof updateDreamStorySchema>;
export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const createProductSchema = z.object({
  title: z
    .string()
    .min(1, "Product title is required")
    .max(120, "Product title must be 120 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or less"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Price must be a positive number",
    }),
  whyIMadeThis: z
    .string()
    .max(1000, "Must be 1000 characters or less")
    .optional()
    .or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string()).optional().default([]),
  productType: z.string().optional().default("Physical Product"),
  shippingWeight: z.number().optional(),
  shippingCost: z.string().optional().or(z.literal("")),
  isDigital: z.boolean().optional().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  content: z
    .string()
    .min(1, "Review content is required")
    .max(2000, "Review must be 2000 characters or less"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// Shipping address schema
export const shippingAddressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required").default("US"),
});

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// Dispute schema
export const createDisputeSchema = z.object({
  orderId: z.string().min(1),
  reason: z.enum(["not_received", "not_as_described", "damaged", "other"]),
  description: z.string().min(10, "Please describe the issue in detail").max(2000),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
