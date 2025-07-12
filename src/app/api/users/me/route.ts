import { NextResponse } from "next/server";
import { handlers } from "@/lib/auth";
import { userService } from "@/services/users.service";
import { UserNotFoundError } from "@/lib/errors/user.errors";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { logger } from "@/services/app-logs.service";

/**
 * API route handler for fetching the current user's profile.
 * Responds to GET /api/users/me
 */
export async function GET() {
	const correlationId = randomUUID();
	const session = await handlers.auth();
	const userId = session?.user?.id;

	logger.info("API request received to get user profile.", {
		correlationId,
		context: "GET /api/users/me",
		userId,
	});

	if (!userId) {
		return createErrorResponse("Unauthorized", "UNAUTHORIZED", 401);
	}

	try {
		const user = await userService.getUserProfile(userId, {
			correlationId,
			context: "GET /api/users/me",
		});
		return createSuccessResponse(user);
	} catch (error) {
		logger.error("An unexpected error occurred in getUserProfile API.", {
			correlationId,
			context: "GET /api/users/me",
			userId,
			meta: { error },
		});

		if (error instanceof UserNotFoundError) {
			return createErrorResponse(error.message, "USER_NOT_FOUND", 404);
		}

		return createErrorResponse(
			"An internal server error occurred.",
			"INTERNAL_SERVER_ERROR",
			500,
		);
	}
}
