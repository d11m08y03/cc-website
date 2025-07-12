import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import {
  EventNotFoundError,
  OrganiserAlreadyAssignedError,
  OrganiserNotFoundError,
  OrganiserNotAssignedError,
} from "@/lib/errors/event.errors";
import { NextRequest } from "next/server";

/**
 * API route handler for adding an organiser to an event.
 * Responds to POST /api/events/[id]/organisers
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const correlationId = randomUUID();
  const eventId = params.id;
  const body = await req.json();
  const { organiserId } = body;

  logger.info("API request received to add organiser to event.", {
    correlationId,
    context: `POST /api/events/${eventId}/organisers`,
    meta: { eventId, organiserId },
  });

  try {
    await eventService.addOrganiserToEvent(eventId, organiserId, {
      correlationId,
    });
    return createSuccessResponse({ added: true });
  } catch (error) {
    logger.error("An unexpected error occurred in addOrganiserToEvent API.", {
      correlationId,
      context: `POST /api/events/${eventId}/organisers`,
      meta: { error },
    });

    if (error instanceof EventNotFoundError) {
      return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
    }

    if (error instanceof OrganiserNotFoundError) {
      return createErrorResponse(error.message, "ORGANISER_NOT_FOUND", 404);
    }

    if (error instanceof OrganiserAlreadyAssignedError) {
      return createErrorResponse(error.message, "ORGANISER_ALREADY_ASSIGNED", 409);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}

/**
 * API route handler for removing an organiser from an event.
 * Responds to DELETE /api/events/[id]/organisers
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const correlationId = randomUUID();
  const eventId = params.id;
  const body = await req.json();
  const { organiserId } = body;

  logger.info("API request received to remove organiser from event.", {
    correlationId,
    context: `DELETE /api/events/${eventId}/organisers`,
    meta: { eventId, organiserId },
  });

  try {
    await eventService.removeOrganiserFromEvent(eventId, organiserId, {
      correlationId,
    });
    return createSuccessResponse({ removed: true });
  } catch (error) {
    logger.error("An unexpected error occurred in removeOrganiserFromEvent API.", {
      correlationId,
      context: `DELETE /api/events/${eventId}/organisers`,
      meta: { error },
    });

    if (error instanceof OrganiserNotAssignedError) {
      return createErrorResponse(error.message, "ORGANISER_NOT_ASSIGNED", 404);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
