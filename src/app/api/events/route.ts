import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { NextRequest } from "next/server";
import { createEventSchema } from "@/lib/validators/event.validators";
import { ZodError } from "zod";

/**
 * API route handler for fetching a list of all events.
 * Responds to GET /api/events
 */
export async function GET() {
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

/**
 * API route handler for creating a new event.
 * Responds to POST /api/events
 */
export async function POST(req: NextRequest) {
  const correlationId = randomUUID();
  const body = await req.json();

  logger.info("API request received to create event.", {
    correlationId,
    context: "POST /api/events",
    meta: { body },
  });

  try {
    const validatedData = createEventSchema.parse(body);
    const newEvent = await eventService.createEvent(validatedData, {
      correlationId,
    });
    return createSuccessResponse(newEvent, 201);
  } catch (error) {
    logger.error("An unexpected error occurred in createEvent API.", {
      correlationId,
      context: "POST /api/events",
      meta: { error },
    });

    if (error instanceof ZodError) {
      return createErrorResponse(error.issues[0].message, "BAD_REQUEST", 400);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
