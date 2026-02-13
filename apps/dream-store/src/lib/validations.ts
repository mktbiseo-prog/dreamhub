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
  milestones: z
    .array(milestoneSchema)
    .length(3, "Please add exactly 3 milestones"),
});

export type CreateDreamStoryInput = z.infer<typeof createDreamStorySchema>;
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
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
