import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";
import { users, teamDetails, teamMembers } from "@/db/postgres/schema";
import { eq, count, sql, and } from "drizzle-orm";

export async function GET() {
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

		const totalUsers = await db.select({ count: count() }).from(users);
		const totalTeams = await db.select({ count: count() }).from(teamDetails);
		const totalMembers = await db.select({ count: count() }).from(teamMembers);

		const pendingProposals = await db
			.select({ count: count() })
			.from(teamDetails)
			.where(eq(teamDetails.approvalStatus, "pending"));

		const approvedProposals = await db
			.select({ count: count() })
			.from(teamDetails)
			.where(eq(teamDetails.approvalStatus, "approved"));

		const rejectedProposals = await db
			.select({ count: count() })
			.from(teamDetails)
			.where(eq(teamDetails.approvalStatus, "rejected"));

		// Calculate dates for new users/teams
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// New Users (last 7 and 30 days)
		const newUsers7Days = await db.select({ count: count() }).from(users).where(sql`${users.createdAt} >= ${sevenDaysAgo}`);
		const newUsers30Days = await db.select({ count: count() }).from(users).where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);

		// New Teams (last 7 and 30 days)
		const newTeams7Days = await db.select({ count: count() }).from(teamDetails).where(sql`${teamDetails.createdAt} >= ${sevenDaysAgo}`);
		const newTeams30Days = await db.select({ count: count() }).from(teamDetails).where(sql`${teamDetails.createdAt} >= ${thirtyDaysAgo}`);

		// Users by Role
		const adminUsers = await db.select({ count: count() }).from(users).where(eq(users.isAdmin, true));
		const judgeUsers = await db.select({ count: count() }).from(users).where(eq(users.isJudge, true));
		const regularUsers = await db.select({ count: count() }).from(users).where(and(eq(users.isAdmin, false), eq(users.isJudge, false)));

		return NextResponse.json({
			totalUsers: totalUsers[0].count,
			totalTeams: totalTeams[0].count,
			totalMembers: totalMembers[0].count,
			pendingProposals: pendingProposals[0].count,
			approvedProposals: approvedProposals[0].count,
			rejectedProposals: rejectedProposals[0].count,
			newUsers7Days: newUsers7Days[0].count,
			newUsers30Days: newUsers30Days[0].count,
			newTeams7Days: newTeams7Days[0].count,
			newTeams30Days: newTeams30Days[0].count,
			adminUsers: adminUsers[0].count,
			judgeUsers: judgeUsers[0].count,
			regularUsers: regularUsers[0].count,
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json(
			{ error: "Internal Server Error", details: (error as Error).message },
			{ status: 500 }
		);
	}
}
