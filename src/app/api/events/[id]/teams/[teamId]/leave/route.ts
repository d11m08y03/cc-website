import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { EventNotFoundError, ParticipantNotFoundError } from "@/lib/errors/event.errors";
import { handlers } from "@/lib/auth";

/**
 * API route handler for a user to leave a team in an event.
 * Responds to DELETE /api/events/[id]/teams/[teamId]/leave
 */
export async function DELETE(
  _: Request,
  { params }: { params: { id: string, teamId: string } },
) {
  const correlationId = randomUUID();
  const { id: eventId, teamId } = params;

  const session = await handlers.auth();
  const userId = session?.user?.id;

  logger.info("API request for user to leave a team.", {
    correlationId,
    context: `DELETE /api/events/${eventId}/teams/${teamId}/leave`,
    userId,
    meta: { eventId, teamId },
  });

  if (!userId) {
    return createErrorResponse("Unauthorized", "UNAUTHORIZED", 401);
  }

  try {
    await eventService.removeParticipantFromTeam(eventId, userId, {
      correlationId,
    });
    return createSuccessResponse({ left: true });
  } catch (error) {
    logger.error("Error removing participant from team.", {
      correlationId,
      context: `DELETE /api/events/${eventId}/teams/${teamId}/leave`,
      userId,
      meta: { error },
    });

    if (error instanceof EventNotFoundError) {
      return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
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
