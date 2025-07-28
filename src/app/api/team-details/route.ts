import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamDetails, users } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";

export async function GET() {
	try {
		const session = await getServerSession(handlers);

		// @ts-ignore
		if (!session || !session.user || !session.user.email) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// @ts-ignore
		const userEmail = session.user.email;

		const user = await db.query.users.findFirst({
			where: eq(users.email, userEmail),
		});

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		const team = await db.query.teamDetails.findFirst({
			where: eq(teamDetails.userId, user.id),
			with: {
				teamMembers: true,
			},
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
