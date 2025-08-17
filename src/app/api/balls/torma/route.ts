import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamDetails, teamMembers } from "@/db/postgres/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
	try {
		const results = await db
			.select({
        id: teamDetails.id,
				teamName: teamDetails.teamName,
				fullName: teamMembers.fullName,
				present: teamMembers.present,
				food: teamMembers.food,
			})
			.from(teamDetails)
			.leftJoin(teamMembers, eq(teamMembers.teamId, teamDetails.id))
			.where(eq(teamDetails.approvalStatus, "approved"))
			.orderBy(asc(teamDetails.teamName), asc(teamMembers.fullName));

		return NextResponse.json(results);
	} catch (error) {
		console.error("Error fetching team details and members:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
