import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
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
  });
}
