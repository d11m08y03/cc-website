import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { EventNotFoundError, TeamAlreadyExistsError } from "@/lib/errors/event.errors";
import {NextRequest} from "next/server";
import { createTeamSchema } from "@/lib/validators/event.validators";
import { ZodError } from "zod";

/**
 * API route handler for creating a new team for an event.
 * Responds to POST /api/events/[id]/teams
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const correlationId = randomUUID();
  const eventId = params.id;
  const body = await req.json();

  logger.info("API request received to create team for event.", {
    correlationId,
    context: `POST /api/events/${eventId}/teams`,
    meta: { eventId, body },
  });

  try {
    const { name } = createTeamSchema.parse(body);
    const newTeam = await eventService.createTeamForEvent(eventId, name, {
      correlationId,
    });
    return createSuccessResponse(newTeam, 201);
  } catch (error) {
    logger.error("An unexpected error occurred in createTeamForEvent API.", {
      correlationId,
      context: `POST /api/events/${eventId}/teams`,
      meta: { error },
    });

    if (error instanceof ZodError) {
      return createErrorResponse(error.issues[0].message, "BAD_REQUEST", 400);
    }

    if (error instanceof EventNotFoundError) {
      return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
    }

    if (error instanceof TeamAlreadyExistsError) {
      return createErrorResponse(error.message, "TEAM_ALREADY_EXISTS", 409);
    }

    return createErrorResponse(
      "An internal server error occurred.",
      "INTERNAL_SERVER_ERROR",
      500,
    );
  }
}