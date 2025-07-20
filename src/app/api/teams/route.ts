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
	projectFile: z.string().nullable(),
	projectFileName: z.string().nullable(),
	userId: z.string().min(1, "User ID is required"), // Added userId to schema
});

const teamSubmissionSchema = z.object({
	teamDetails: teamDetailsSchema,
	members: z.array(memberSchema).min(1).max(5),
});

import { teamMembers } from "@/db/postgres/schema";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const validatedData = teamSubmissionSchema.parse(body);

		const [newTeam] = await db
			.insert(teamDetails)
			.values({
				userId: validatedData.teamDetails.userId,
				teamName: validatedData.teamDetails.teamName,
				projectFile: validatedData.teamDetails.projectFile,
				projectFileName: validatedData.teamDetails.projectFileName,
			})
			.onConflictDoUpdate({
				target: teamDetails.userId,
				set: {
					teamName: validatedData.teamDetails.teamName,
					projectFile: validatedData.teamDetails.projectFile,
					projectFileName: validatedData.teamDetails.projectFileName,
				},
			})
			.returning({ id: teamDetails.id });

		if (!newTeam) {
			throw new Error("Failed to create or update team details.");
		}

		const teamId = newTeam.id;

		const membersToInsert = validatedData.members.map((member, index) => ({
			teamId: teamId,
			userId: index === 0 ? validatedData.teamDetails.userId : undefined, // Assign userId only to the leader
			role: index === 0 ? "leader" : "member", // Assign role based on index
			fullName: member.fullName,
			email: member.email,
			contactNumber: member.contactNumber,
			foodPreference: member.foodPreference,
			tshirtSize: member.tshirtSize,
			allergies: member.allergies,
		}));

		await db.insert(teamMembers).values(membersToInsert).onConflictDoNothing();

		return NextResponse.json(
			{ message: "Team details and members saved successfully" },
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ message: "Validation Error" },
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
