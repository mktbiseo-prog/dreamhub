import { NextResponse } from "next/server";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const i18n = i18nMiddleware(req);
  const { teamId } = await params;
  const { userId, role } = await req.json();
  return NextResponse.json({
    member: {
      id: `tm-${Date.now()}`,
      teamId,
      userId,
      role: role ?? "CONTRIBUTOR",
      joinedAt: new Date().toISOString(),
    },
    meta: i18n.meta,
  });
}
