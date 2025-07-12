import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import {
  EventNotFoundError,
  ParticipantAlreadyExistsError,
} from "@/lib/errors/event.errors";
import { UserNotFoundError } from "@/lib/errors/user.errors";
import { handlers } from "@/lib/auth";

/**
 * API route handler for registering the current user for a specific event.
 * Responds to POST /api/events/[id]/register
 */
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const correlationId = randomUUID();
  const eventId = params.id;

  const session = await handlers.auth();
  const userId = session?.user?.id;

  logger.info("API request to register for an event.", {
    correlationId,
    context: `POST /api/events/${eventId}/register`,
    userId,
    meta: { eventId },
  });

  if (!userId) {
    return createErrorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    await eventService.registerParticipantForEvent(eventId, userId, {
      correlationId,
    });
    return createSuccessResponse({ registered: true });
  } catch (error) {
    logger.error("Error registering participant for event.", {
      correlationId,
      context: `POST /api/events/${eventId}/register`,
      userId,
      meta: { error },
    });

    if (error instanceof EventNotFoundError) {
      return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
    }
    if (error instanceof UserNotFoundError) {
      return createErrorResponse(error.message, "USER_NOT_FOUND", 404);
    }
    if (error instanceof ParticipantAlreadyExistsError) {
      return createErrorResponse(error.message, "ALREADY_REGISTERED", 409);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
