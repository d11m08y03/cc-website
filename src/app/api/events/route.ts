import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";

import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";

/**
 * API route handler for fetching a list of all events.
 * Responds to GET /api/events
 */
export async function GET(_: Request) {
  const correlationId = randomUUID();

  logger.info("API request received to get event list.", {
    correlationId,
    context: "GET /api/events",
  });

  try {
    const options = { limit: 50, offset: 0 };

    const events = await eventService.getEventList(options, { correlationId });

    return createSuccessResponse(events);
  } catch (error) {
    logger.error("An unexpected error occurred in getEventList API.", {
      correlationId,
      context: "GET /api/events",
      meta: { error },
    });

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
