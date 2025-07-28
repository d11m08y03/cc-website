import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { teamDetails, users } from "@/db/postgres/schema";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ teamId: string }> },
) {
	try {
		const session = await getServerSession(handlers);

		// @ts-ignore
		if (!session || !session.user || !session.user.email) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		// @ts-ignore
		const userEmail = session.user.email;

		const adminUser = await db.query.users.findFirst({
			where: eq(users.email, userEmail),
		});

		if (!adminUser || !adminUser.isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const teamId = (await params).teamId;

		if (!teamId) {
			return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
		}

		const team = await db.query.teamDetails.findFirst({
			where: eq(teamDetails.id, teamId),
			with: {
				teamMembers: true,
			},
		});

		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 });
		}

		return NextResponse.json(team);
	} catch (error) {
		console.error("Error fetching team details:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
