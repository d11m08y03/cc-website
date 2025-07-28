import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";
import { users, teamDetails } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
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
		const { status } = await request.json();

		if (!teamId || !status) {
			return NextResponse.json({ error: "Team ID and status are required" }, { status: 400 });
		}

		if (!["pending", "approved", "rejected"].includes(status)) {
			return NextResponse.json({ error: "Invalid status" }, { status: 400 });
		}

		const team = await db.query.teamDetails.findFirst({
			where: eq(teamDetails.id, teamId),
		});

		if (!team) {
			return NextResponse.json({ error: "Team not found" }, { status: 404 });
		}

		await db
			.update(teamDetails)
			.set({ approvalStatus: status })
			.where(eq(teamDetails.id, teamId));

		return NextResponse.json({ message: `Team status updated to ${status}` });
	} catch (error) {
		console.error("Error updating team status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: (error as Error).message },
			{ status: 500 }
		);
	}
}
