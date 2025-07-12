import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import {
  EventNotFoundError,
  TeamNotFoundError,
  ParticipantNotFoundError,
} from "@/lib/errors/event.errors";
import { handlers } from "@/lib/auth";

/**
 * API route handler for a user to join a team in an event.
 * Responds to POST /api/events/[id]/teams/[teamId]/join
 */
export async function POST(
  _: Request,
  { params }: { params: { id: string; teamId: string } },
) {
  const correlationId = randomUUID();
  const { id: eventId, teamId } = params;

  const session = await handlers.auth();
  const userId = session?.user?.id;

  logger.info("API request for user to join a team.", {
    correlationId,
    context: `POST /api/events/${eventId}/teams/${teamId}/join`,
    userId,
    meta: { eventId, teamId },
  });

  if (!userId) {
    return createErrorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    await eventService.assignParticipantToTeam(eventId, userId, teamId, {
      correlationId,
    });
    return createSuccessResponse({ joined: true });
  } catch (error) {
    logger.error("Error assigning participant to team.", {
      correlationId,
      context: `POST /api/events/${eventId}/teams/${teamId}/join`,
      userId,
      meta: { error },
    });

    if (error instanceof EventNotFoundError) {
      return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
    }
    if (error instanceof TeamNotFoundError) {
      return createErrorResponse(error.message, "TEAM_NOT_FOUND", 404);
    }
    if (error instanceof ParticipantNotFoundError) {
      return createErrorResponse(error.message, "PARTICIPANT_NOT_FOUND", 404);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
