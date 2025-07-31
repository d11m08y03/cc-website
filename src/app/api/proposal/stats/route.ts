import { db } from "@/db/client";
import { teamDetails } from "@/db/postgres/schema";
import { eq, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      db.select({ value: count() }).from(teamDetails),
      db.select({ value: count() }).from(teamDetails).where(eq(teamDetails.approvalStatus, "pending")),
      db.select({ value: count() }).from(teamDetails).where(eq(teamDetails.approvalStatus, "approved")),
      db.select({ value: count() }).from(teamDetails).where(eq(teamDetails.approvalStatus, "rejected")),
    ]);

    return NextResponse.json({
      total: total[0].value,
      pending: pending[0].value,
      approved: approved[0].value,
      rejected: rejected[0].value,
    });
  } catch (error) {
    console.error("Error fetching proposal stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch proposal stats" },
      { status: 500 },
    );
  }
}
