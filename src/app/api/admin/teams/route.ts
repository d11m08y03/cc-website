import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";
import { users } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";

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

		if (!user || !user.isAdmin) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const teams = await db.query.teamDetails.findMany({
			with: {
				teamMembers: true,
				user: true, // Include the user (leader) details
			},
		});

		return NextResponse.json(teams);
	} catch (error) {
		console.error("Error fetching teams:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: (error as Error).message },
			{ status: 500 }
		);
	}
}
