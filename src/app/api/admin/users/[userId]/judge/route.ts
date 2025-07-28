import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";

export async function PATCH(
	request: Request,
	{ params }: { params: Promise<{ userId: string }> },
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

		const userId = (await params).userId;
		const { isJudge } = await request.json();

		if (!userId) {
			return NextResponse.json({ error: "User ID is required" }, { status: 400 });
		}

		if (typeof isJudge !== 'boolean') {
			return NextResponse.json({ error: "isJudge boolean is required" }, { status: 400 });
		}

		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		await db
			.update(users)
			.set({ isJudge: isJudge })
			.where(eq(users.id, userId));

		return NextResponse.json({ message: `User judge status updated to ${isJudge}` });
	} catch (error) {
		console.error("Error updating user judge status:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: (error as Error).message },
			{ status: 500 }
		);
	}
}
