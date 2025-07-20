import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamMembers, teamDetails, users } from "@/db/postgres/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";
import { z } from "zod";

const memberUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .regex(/^[0-9]+$/, "Invalid contact number")
    .optional(),
  foodPreference: z.string().min(1, "Food preference is required").optional(),
  tshirtSize: z.string().min(1, "T-shirt size is required").optional(),
  allergies: z.string().optional(),
  role: z.string().optional(), // Allow role to be updated if needed, though typically handled by leader logic
});

export async function PUT(
  req: Request,
  { params }: { params: { memberId: string } },
) {
  try {
    const session = await getServerSession(handlers);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userEmail = session.user.email;
    const userId = (await db.query.users.findFirst({
      where: eq(users.email, userEmail),
    }))?.id;

    if (!userId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const memberId = params.memberId;
    const body = await req.json();
    const validatedData = memberUpdateSchema.parse(body);

    // Verify that the member belongs to the current user's team
    const team = await db.query.teamDetails.findFirst({
      where: eq(teamDetails.userId, userId),
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const existingMember = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, team.id)),
    });

    if (!existingMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    await db
      .update(teamMembers)
      .set(validatedData)
      .where(eq(teamMembers.id, memberId));

    return NextResponse.json(
      { message: "Member updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error updating member:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
