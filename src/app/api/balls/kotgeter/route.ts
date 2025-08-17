import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamMembers } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const memberId = searchParams.get("id");

		if (!memberId) {
			return NextResponse.json(
				{ message: "Member ID is required" },
				{ status: 400 }
			);
		}

		const result = await db
			.select({
				fullName: teamMembers.fullName,
				present: teamMembers.present,
				food: teamMembers.food,
			})
			.from(teamMembers)
			.where(eq(teamMembers.id, memberId));

		if (result.length === 0) {
			return NextResponse.json({ message: "Member not found" }, { status: 404 });
		}

		return NextResponse.json(result[0]);
	} catch (error) {
		console.error("Error fetching team member:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
