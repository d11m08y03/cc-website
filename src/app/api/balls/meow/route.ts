import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamMembers } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		const shit = searchParams.get("shit");
		const action = searchParams.get("action");

		if (!id || !shit || !action) {
			return NextResponse.json(
				{ message: "Missing required query parameters: id, shit, action" },
				{ status: 400 }
			);
		}

		const allowedShit = ["food", "presence"];
		if (!allowedShit.includes(shit)) {
			return NextResponse.json(
				{ message: "Invalid 'shit' parameter. Must be 'food' or 'presence'." },
				{ status: 400 }
			);
		}

		const allowedActions = ["meowyes", "meowno"];
		if (!allowedActions.includes(action)) {
			return NextResponse.json(
				{ message: "Invalid 'action' parameter. Must be 'meowyes' or 'meowno'." },
				{ status: 400 }
			);
		}

		const value = action === "meowyes";
		let setData: { food?: boolean; present?: boolean } = {};

		if (shit === "food") {
			setData.food = value;
		} else {
			setData.present = value;
		}

		await db.update(teamMembers).set(setData).where(eq(teamMembers.id, id));

		return NextResponse.json({
			message: `Successfully updated ${shit} for member ${id} to ${value}`,
		});
	} catch (error) {
		console.error("Error updating team member:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
