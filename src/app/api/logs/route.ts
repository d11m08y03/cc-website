import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { LogLevel } from "@/lib/types/app-logs.types";

/**
 * API route handler for fetching application logs.
 * Responds to GET /api/logs
 */
export async function GET(req: NextRequest) {
  const correlationId = randomUUID();
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId") || undefined;
  const level = (searchParams.get("level") as LogLevel) || undefined;

  logger.info("API request received to get application logs.", {
    correlationId,
    context: "GET /api/logs",
    meta: { userId, level },
  });

  try {
    const logs = await logger.getLogs({
      userId,
      level,
    });
    return createSuccessResponse(logs);
  } catch (error) {
    logger.error("An unexpected error occurred in getLogs API.", {
      correlationId,
      context: "GET /api/logs",
      meta: { error },
    });

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}