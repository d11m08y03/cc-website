import { userService } from "@/services/users.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { setOrganiserStatusSchema } from "@/lib/validators/organiser.validators";
import { ZodError } from "zod";
import { UserNotFoundError } from "@/lib/errors/user.errors";

/**
 * API route handler for fetching all users who are organisers.
 * Responds to GET /api/organisers
 */
export async function GET() {
  const correlationId = randomUUID();

  logger.info("API request received to get all organisers (users).", {
    correlationId,
    context: "GET /api/organisers",
  });

  try {
    const organisers = await userService.getAllOrganisers({ correlationId });
    return createSuccessResponse(organisers);
  } catch (error) {
    logger.error("An unexpected error occurred in getAllOrganisers API.", {
      correlationId,
      context: "GET /api/organisers",
      meta: { error },
    });

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}

/**
 * API route handler for setting a user's organiser status.
 * Responds to POST /api/organisers
 */
export async function POST(req: NextRequest) {
  const correlationId = randomUUID();
  const body = await req.json();

  logger.info("API request received to set user organiser status.", {
    correlationId,
    context: "POST /api/organisers",
    meta: { body },
  });

  try {
    const { userId, isOrganiser } = setOrganiserStatusSchema.parse(body);
    const updatedUser = await userService.setOrganiserStatus(
      userId,
      isOrganiser,
      {
        correlationId,
      },
    );
    return createSuccessResponse(updatedUser, 200);
  } catch (error) {
    logger.error("An unexpected error occurred in setOrganiserStatus API.", {
      correlationId,
      context: "POST /api/organisers",
      meta: { error },
    });

    if (error instanceof ZodError) {
      return createErrorResponse(error.issues[0].message, "BAD_REQUEST", 400);
    }

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
