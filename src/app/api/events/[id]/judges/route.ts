import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import {
  EventNotFoundError,
  JudgeAlreadyAssignedError,
  JudgeNotAssignedError,
} from "@/lib/errors/event.errors";
import { NextRequest } from "next/server";
import { UserNotFoundError } from "@/lib/errors/user.errors";

/**
 * API route handler for adding a judge to an event.
 * Responds to POST /api/events/[id]/judges
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const correlationId = randomUUID();
  const eventId = params.id;
  const body = await req.json();
  const { userId } = body;

  logger.info("API request received to add judge to event.", {
    correlationId,
    context: `POST /api/events/${eventId}/judges`,
    meta: { eventId, userId },
  });

  try {
    await eventService.addJudgeToEvent(eventId, userId, {
      correlationId,
    });
    return createSuccessResponse({ added: true });
  } catch (error) {
    logger.error("An unexpected error occurred in addJudgeToEvent API.", {
      correlationId,
      context: `POST /api/events/${eventId}/judges`,
      meta: { error },
    });

    if (error instanceof EventNotFoundError) {
      return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
    }

    if (error instanceof UserNotFoundError) {
      return createErrorResponse(error.message, "USER_NOT_FOUND", 404);
    }

    if (error instanceof JudgeAlreadyAssignedError) {
      return createErrorResponse(error.message, "JUDGE_ALREADY_ASSIGNED", 409);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}

/**
 * API route handler for removing a judge from an event.
 * Responds to DELETE /api/events/[id]/judges
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const correlationId = randomUUID();
  const eventId = params.id;
  const body = await req.json();
  const { userId } = body;

  logger.info("API request received to remove judge from event.", {
    correlationId,
    context: `DELETE /api/events/${eventId}/judges`,
    meta: { eventId, userId },
  });

  try {
    await eventService.removeJudgeFromEvent(eventId, userId, {
      correlationId,
    });
    return createSuccessResponse({ removed: true });
  } catch (error) {
    logger.error("An unexpected error occurred in removeJudgeFromEvent API.", {
      correlationId,
      context: `DELETE /api/events/${eventId}/judges`,
      meta: { error },
    });

    if (error instanceof JudgeNotAssignedError) {
      return createErrorResponse(error.message, "JUDGE_NOT_ASSIGNED", 404);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}
