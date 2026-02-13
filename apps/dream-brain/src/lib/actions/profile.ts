"use server";

import { prisma } from "@dreamhub/database";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  dreamStatement: z.string().max(500).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
});

export async function updateUserProfile(input: {
  name?: string;
  bio?: string;
  dreamStatement?: string;
  skills?: string[];
  interests?: string[];
}) {
  const parsed = UpdateProfileSchema.parse(input);
  const userId = await getCurrentUserId();

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed,
  });

  revalidatePath("/profile");
  revalidatePath("/");
  return updated;
}
