import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamMembers } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { handlers } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const session = await getServerSession(handlers);

  // @ts-ignore
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const memberId = (await params).memberId;

  const {
    fullName,
    email,
    contactNumber,
    foodPreference,
    tshirtSize,
    allergies,
    role,
  } = await req.json();

  if (
    !memberId ||
    !fullName ||
    !email ||
    !contactNumber ||
    !foodPreference ||
    !tshirtSize ||
    !role
  ) {
    console.log(
      memberId,
      fullName,
      email,
      contactNumber,
      foodPreference,
      tshirtSize,
      allergies,
      role,
    );
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // Optional: Add authorization check here to ensure the logged-in user can modify this member
    // e.g., check if the member belongs to a team owned by the user

    await db
      .update(teamMembers)
      .set({
        fullName,
        email,
        contactNumber,
        foodPreference,
        tshirtSize,
        allergies,
        role,
      })
      .where(eq(teamMembers.id, memberId));

    return NextResponse.json(
      { message: "Team member updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const session = await getServerSession(handlers);

  // @ts-ignore
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const memberId = (await params).memberId;

  if (!memberId) {
    return NextResponse.json(
      { message: "Member ID is required" },
      { status: 400 },
    );
  }

  try {
    // Optional: Add authorization check here to ensure the logged-in user can delete this member
    // e.g., check if the member belongs to a team owned by the user

    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));

    return NextResponse.json(
      { message: "Team member deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
