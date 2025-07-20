/* eslint-disable */

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
			return NextResponse.json({ isRegistered: false }, { status: 200 });
		}

		// @ts-ignore
		const userEmail = session.user.email;

		const user = await db.query.users.findFirst({
			where: eq(users.email, userEmail),
		});

		if (!user) {
			return NextResponse.json({ isRegistered: false }, { status: 200 });
		}

		const userId = user.id;

		const existingTeam = await db.query.teamDetails.findFirst({
			where: eq(teamDetails.userId, userId),
		});

		return NextResponse.json({ isRegistered: !!existingTeam }, { status: 200 });
	} catch (error) {
		console.error("Error checking registration status:", error);

		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
