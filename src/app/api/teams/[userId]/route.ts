import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamDetails } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";

export async function GET(
	req: NextRequest,
	// The fix is here: type the 'context' object directly
	{ params }: { params: Promise<{ userId: string }> },
) {
	try {
		const userId = (await params).userId

		if (!userId) {
			return NextResponse.json(
				{ message: "User ID is required" },
				{ status: 400 },
			);
		}

		const team = await db.query.teamDetails.findFirst({
			where: eq(teamDetails.userId, userId),
		});

		if (!team) {
			return NextResponse.json({ message: "Team not found" }, { status: 404 });
		}

		return NextResponse.json(team, { status: 200 });
	} catch (error) {
		console.error("Error fetching team details:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
