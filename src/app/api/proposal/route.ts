import { db } from "@/db/client";
import { teamDetails } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";

    const proposals = await db.query.teamDetails.findMany({
      columns: {
        id: true,
        teamName: true,
        projectFileName: true,
        createdAt: true,
        userId: true,
        approvalStatus: true,
      },
      where: status === "all" ? undefined : eq(teamDetails.approvalStatus, status),
      with: {
        teamMembers: true,
      },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { message: "Failed to fetch proposals" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { teamId, status } = await req.json();

    if (!teamId || !status) {
      return NextResponse.json(
        { message: "Team ID and status are required" },
        { status: 400 },
      );
    }

    await db
      .update(teamDetails)
      .set({ approvalStatus: status })
      .where(eq(teamDetails.id, teamId));

    return NextResponse.json({ message: "Proposal status updated successfully" });
  } catch (error) {
    console.error("Error updating proposal status:", error);
    return NextResponse.json(
      { message: "Failed to update proposal status" },
      { status: 500 },
    );
  }
}
