import { userService } from "@/services/users.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { UserNotFoundError } from "@/lib/errors/user.errors";

/**
 * API route handler for fetching users.
 * Responds to GET /api/users (for all users or search) or GET /api/users?me=true (for current user)
 */
export async function GET(req: NextRequest) {
  const correlationId = randomUUID();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const fetchMe = searchParams.get("me");

  if (fetchMe) {
    const session = await handlers.auth(); // Assuming handlers.auth() is available
    const userId = session?.user?.id;

    logger.info("API request received to get current user profile.", {
      correlationId,
      context: "GET /api/users?me=true",
      userId,
    });

    if (!userId) {
      return createErrorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    try {
      const user = await userService.getUserProfile(userId, {
        correlationId,
        context: "GET /api/users?me=true",
      });
      return createSuccessResponse(user);
    } catch (error) {
      logger.error("An unexpected error occurred in getUserProfile API.", {
        correlationId,
        context: "GET /api/users?me=true",
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
  } else if (search) {
    logger.info("API request received to search users.", {
      correlationId,
      context: `GET /api/users?search=${search}`,
      meta: { search },
    });

    try {
      const users = await userService.searchUsers(search, { correlationId }); // You need to implement searchUsers in userService
      return createSuccessResponse(users);
    } catch (error) {
      logger.error("An unexpected error occurred in searchUsers API.", {
        correlationId,
        context: `GET /api/users?search=${search}`,
        meta: { error },
      });

      return createErrorResponse(
        "An internal server error occurred.",
        "INTERNAL_SERVER_ERROR",
        500,
      );
    }
  } else {
    logger.info("API request received to get all users.", {
      correlationId,
      context: "GET /api/users",
    });

    try {
      const users = await userService.getAllUsers({ correlationId }); // You need to implement getAllUsers in userService
      return createSuccessResponse(users);
    } catch (error) {
      logger.error("An unexpected error occurred in getAllUsers API.", {
        correlationId,
        context: "GET /api/users",
        meta: { error },
      });

      return createErrorResponse(
        "An internal server error occurred.",
        "INTERNAL_SERVER_ERROR",
        500,
      );
    }
  }
}
