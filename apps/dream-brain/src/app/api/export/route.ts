import { NextRequest, NextResponse } from "next/server";
import { mockThoughts } from "@/lib/mock-data";

interface ExportRequestBody {
  format: "json" | "csv";
  userId: string;
}

function thoughtsToCsv(thoughts: typeof mockThoughts): string {
  const headers = [
    "id",
    "title",
    "body",
    "summary",
    "category",
    "tags",
    "keywords",
    "createdAt",
    "importance",
    "emotion",
    "valence",
    "peopleMentioned",
    "placesMentioned",
  ];

  const rows = thoughts.map((t) => {
    const escape = (val: string) =>
      `"${val.replace(/"/g, '""').replace(/\n/g, " ")}"`;

    return [
      escape(t.id),
      escape(t.title),
      escape(t.body),
      escape(t.summary),
      escape(t.category),
      escape(t.tags.join("; ")),
      escape(t.keywords.join("; ")),
      escape(t.createdAt),
      String(t.importance),
      escape(t.emotion || ""),
      String(t.valence ?? ""),
      escape(t.peopleMentioned.join("; ")),
      escape(t.placesMentioned.join("; ")),
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExportRequestBody;

    if (!body.format || !["json", "csv"].includes(body.format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be 'json' or 'csv'." },
        { status: 400 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required." },
        { status: 400 }
      );
    }

    // In production, fetch from DB using userId
    // For demo, use mock data
    const thoughts = mockThoughts;

    if (body.format === "json") {
      const jsonData = JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          userId: body.userId,
          totalThoughts: thoughts.length,
          thoughts: thoughts.map((t) => ({
            id: t.id,
            title: t.title,
            body: t.body,
            summary: t.summary,
            category: t.category,
            tags: t.tags,
            keywords: t.keywords,
            createdAt: t.createdAt,
            importance: t.importance,
            emotion: t.emotion,
            emotionSecondary: t.emotionSecondary ?? null,
            valence: t.valence,
            emotionConfidence: t.emotionConfidence,
            actionItems: t.actionItems,
            peopleMentioned: t.peopleMentioned,
            placesMentioned: t.placesMentioned,
            isFavorite: t.isFavorite,
            isArchived: t.isArchived,
            isPinned: t.isPinned,
          })),
        },
        null,
        2
      );

      return new NextResponse(jsonData, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="dream-brain-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    // CSV format
    const csvData = thoughtsToCsv(thoughts);

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="dream-brain-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[export] Failed to export data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
