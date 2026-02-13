import { NextResponse } from "next/server";

/**
 * POST /api/ai/match-explanation
 * Generates a human-readable explanation of why two profiles matched.
 * Mock: template-based. Production: GPT-4o-mini.
 */
export async function POST(req: Request) {
  try {
    const { profileA, profileB, scores } = await req.json();

    if (!profileA || !profileB || !scores) {
      return NextResponse.json(
        { error: "profileA, profileB, and scores are required" },
        { status: 400 }
      );
    }

    // --- Mock explanation (template-based) ---
    const parts: string[] = [];

    // Dream alignment
    if (scores.dreamScore >= 50) {
      parts.push(
        `You both share a passion for ${profileA.dreamCategory || "innovation"}-related dreams`
      );
    }

    // Skill complementarity
    const complementary = (profileB.skillsOffered || []).filter(
      (s: string) => (profileA.skillsNeeded || []).includes(s)
    );
    if (complementary.length > 0) {
      parts.push(
        `${profileB.name} brings ${complementary.slice(0, 2).join(" and ")} — skills you're looking for`
      );
    }

    const reverse = (profileA.skillsOffered || []).filter(
      (s: string) => (profileB.skillsNeeded || []).includes(s)
    );
    if (reverse.length > 0) {
      parts.push(
        `You offer ${reverse.slice(0, 2).join(" and ")} that ${profileB.name} needs`
      );
    }

    // Shared interests
    const sharedInterests = (profileA.interests || []).filter(
      (i: string) => (profileB.interests || []).includes(i)
    );
    if (sharedInterests.length > 0) {
      parts.push(
        `You share interests in ${sharedInterests.join(", ")}`
      );
    }

    // Location
    if (
      profileA.city &&
      profileB.city &&
      profileA.city.toLowerCase() === profileB.city.toLowerCase()
    ) {
      parts.push(`You're both based in ${profileA.city}`);
    } else if (
      profileA.country &&
      profileB.country &&
      profileA.country.toLowerCase() === profileB.country.toLowerCase()
    ) {
      parts.push(`You're both in ${profileA.country}`);
    }

    const explanation =
      parts.length > 0
        ? `You matched because: ${parts.join(". ")}. Together, you could build something amazing!`
        : `You and ${profileB.name} have complementary profiles that could lead to a great collaboration!`;

    return NextResponse.json({ explanation });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
