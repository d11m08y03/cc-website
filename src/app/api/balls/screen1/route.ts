import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamMembers } from "@/db/postgres/schema";
import { count, sql } from "drizzle-orm";

export async function GET() {
	try {
		const result = await db
			.select({
				total_members: count(),
				present_members: count(
					sql<number>`case when ${teamMembers.present} then 1 end`
				),
				members_with_food: count(
					sql<number>`case when ${teamMembers.food} then 1 end`
				),
			})
			.from(teamMembers);

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
