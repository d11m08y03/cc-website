import { db } from "@/db/client";
import { teamDetails } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const teamId = (await params).teamId;
    const proposal = await db.query.teamDetails.findFirst({
      where: eq(teamDetails.id, teamId),
      columns: {
        projectFile: true,
      },
    });

    if (!proposal) {
      return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal details:", error);
    return NextResponse.json(
      { message: "Failed to fetch proposal details" },
      { status: 500 },
    );
  }
}
