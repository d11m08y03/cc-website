import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";

import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";

import { EventNotFoundError } from "@/lib/errors/event.errors";

/**
 * API route handler for fetching the details of a single event.
 * Responds to GET /api/events/[id]
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const correlationId = randomUUID();
  const eventId = params.id;

  logger.info("API request received to get event details.", {
    correlationId,
    context: "GET /api/events/[id]",
    meta: { eventId },
  });

  try {
    const eventDetails = await eventService.getEventDetails(eventId, {
      correlationId,
    });

    return createSuccessResponse(eventDetails);
  } catch (error) {
    if (error instanceof EventNotFoundError) {
      logger.warn("Event not found for requested ID.", {
        correlationId,
        context: "GET /api/events/[id]",
        meta: { eventId },
      });

      return createErrorResponse(error.message, "NOT_FOUND", 404);
    }

    logger.error("An unexpected error occurred in getEventDetails API.", {
      correlationId,
      context: "GET /api/events/[id]",
      meta: { error },
    });

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
