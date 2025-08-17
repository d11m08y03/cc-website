import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamMembers, teamDetails } from "@/db/postgres/schema";
import { count, sql } from "drizzle-orm";

export async function GET() {
	try {
		const result = await db
			.select({
				total_members: count(),
				present_members: count(
					sql<number>`CASE WHEN ${teamMembers.present} THEN 1 END`
				),
				members_with_food: count(
					sql<number>`CASE WHEN ${teamMembers.food} THEN 1 END`
				),
			})
			.from(teamMembers)
			.leftJoin(
				teamDetails,
				sql`${teamDetails.id} = ${teamMembers.teamId}`
			)
			.where(sql`${teamDetails.approvalStatus} = 'approved'`);

		const stats = result[0];

		return NextResponse.json(stats);
	} catch (error) {
		console.error("Error fetching team member stats:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
