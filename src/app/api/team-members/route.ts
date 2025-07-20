import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db/client";
import { teamMembers } from "@/db/postgres/schema";
import { v4 as uuidv4 } from "uuid";
import { handlers } from "@/lib/auth";

export async function POST(req: Request) {
	const session = await getServerSession(handlers);

	// @ts-ignore
	if (!session || !session.user || !session.user.email) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	try {
		const {
			teamId,
			fullName,
			email,
			contactNumber,
			foodPreference,
			tshirtSize,
			allergies,
			role,
		} = await req.json();

		if (
			!teamId ||
			!fullName ||
			!email ||
			!contactNumber ||
			!foodPreference ||
			!tshirtSize ||
			!role
		) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 },
			);
		}

		const newMemberId = uuidv4();

		await db.insert(teamMembers).values({
			id: newMemberId,
			teamId,
			userId: null, // This will be set if the member is a registered user
			fullName,
			email,
			contactNumber,
			foodPreference,
			tshirtSize,
			allergies,
			role,
		});

		return NextResponse.json(
			{ message: "Team member added successfully", memberId: newMemberId },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error adding team member:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
