"use server";

import { prisma } from "@dreamhub/database";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function createPoll(
  dreamStoryId: string,
  input: { question: string; options: string[]; endsAt?: string }
) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const story = await prisma.dreamStory.findUnique({
    where: { id: dreamStoryId },
    select: { userId: true },
  });

  if (!story || story.userId !== userId) {
    throw new Error("Only the dream creator can create polls");
  }

  if (!input.question.trim()) {
    throw new Error("Poll question is required");
  }

  const validOptions = input.options.filter((o) => o.trim());
  if (validOptions.length < 2) {
    throw new Error("At least 2 options are required");
  }
  if (validOptions.length > 5) {
    throw new Error("Maximum 5 options allowed");
  }

  await prisma.poll.create({
    data: {
      dreamStoryId,
      question: input.question.trim(),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      options: {
        createMany: {
          data: validOptions.map((label) => ({ label: label.trim() })),
        },
      },
    },
  });

  revalidatePath(`/stories/${dreamStoryId}`);
}

export async function votePoll(optionId: string) {
  const userId = await getCurrentUserId();

  // Find the poll this option belongs to
  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    include: {
      poll: {
        select: {
          id: true,
          dreamStoryId: true,
          endsAt: true,
          options: {
            select: {
              id: true,
              votes: {
                where: { userId },
              },
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new Error("Poll option not found");
  }

  // Check if poll has ended
  if (option.poll.endsAt && new Date(option.poll.endsAt) < new Date()) {
    throw new Error("This poll has ended");
  }

  // Check if user already voted on any option in this poll
  const existingVote = option.poll.options.find(
    (o) => o.votes.length > 0
  );

  if (existingVote) {
    throw new Error("You have already voted on this poll");
  }

  await prisma.pollVote.create({
    data: {
      optionId,
      userId,
    },
  });

  revalidatePath(`/stories/${option.poll.dreamStoryId}`);
}

export async function deletePoll(pollId: string) {
  const userId = await getCurrentUserId();

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      dreamStory: { select: { userId: true, id: true } },
    },
  });

  if (!poll || poll.dreamStory.userId !== userId) {
    throw new Error("Only the dream creator can delete polls");
  }

  await prisma.poll.delete({ where: { id: pollId } });

  revalidatePath(`/stories/${poll.dreamStory.id}`);
}
