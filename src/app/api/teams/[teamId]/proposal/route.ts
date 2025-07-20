import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamDetails, teamMembers, users } from "@/db/postgres/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";

export async function PUT(
	req: Request,
	{ params }: { params: Promise<{ teamId: string }> },
) {
	const session = await getServerSession(handlers);

	// @ts-ignore
	if (!session || !session.user || !session.user.email) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { teamId } = await params;
	const { projectFile, projectFileName } = await req.json();

	if (!teamId || !projectFile || !projectFileName) {
		return NextResponse.json(
			{ message: "Missing required fields" },
			{ status: 400 },
		);
	}

	try {
		// @ts-ignore
		const userEmail = session.user.email;

		const user = await db.query.users.findFirst({
			where: eq(users.email, userEmail),
		});

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Verify that the user is the owner of this team and is authorized to update it
		const userTeam = await db.query.teamDetails.findFirst({
			where: and(eq(teamDetails.id, teamId), eq(teamDetails.userId, user.id)),
			with: {
				teamMembers: true,
			},
		});

		if (!userTeam) {
			return NextResponse.json({ message: "Forbidden" }, { status: 403 });
		}

		await db
			.update(teamDetails)
			.set({
				projectFile,
				projectFileName,
			})
			.where(eq(teamDetails.id, teamId));

		return NextResponse.json(
			{ message: "Project proposal updated successfully" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error updating project proposal:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
