import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { teamDetails } from "@/db/postgres/schema";
import { z } from "zod";


const memberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .regex(/^[0-9]+$/, "Invalid contact number"),
  foodPreference: z.string().min(1, "Food preference is required"),
  tshirtSize: z.string().min(1, "T-shirt size is required"),
  allergies: z.string().optional(),
});

const teamDetailsSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  members: z.array(memberSchema).min(3).max(5),
  projectFile: z.string().nullable(),
  userId: z.string().min(1, "User ID is required"), // Added userId to schema
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = teamDetailsSchema.parse(body);

    await db.insert(teamDetails)
      .values({
        userId: validatedData.userId, // Use userId from validatedData
        teamName: validatedData.teamName,
        members: validatedData.members,
        projectFile: validatedData.projectFile,
      })
      .onConflictDoUpdate({
        target: teamDetails.userId,
        set: {
          teamName: validatedData.teamName,
          members: validatedData.members,
          projectFile: validatedData.projectFile,
        },
      });

    return NextResponse.json(
      { message: "Team details saved successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error"},
        { status: 400 },
      );
    }
    console.error("Error saving team details:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
