import { eventService } from "@/services/events.service";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-helpers";
import { EventNotFoundError } from "@/lib/errors/event.errors";
import { NextRequest } from "next/server";

/**
 * API route handler for fetching a single event by its ID.
 * Responds to GET /api/events/[id]
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
	const correlationId = randomUUID();
	const eventId = params.id;

	logger.info("API request received to get event details.", {
		correlationId,
		context: `GET /api/events/${eventId}`,
		meta: { eventId },
	});

	try {
		const event = await eventService.getEventDetails(eventId, {
			correlationId,
		});
		return createSuccessResponse(event);
	} catch (error) {
		logger.error("An unexpected error occurred in getEventDetails API.", {
			correlationId,
			context: `GET /api/events/${eventId}`,
			meta: { error },
		});

		if (error instanceof EventNotFoundError) {
			return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
		}

		return createErrorResponse(
			"An internal server error occurred.",
			"INTERNAL_SERVER_ERROR",
			500,
		);
	}
}

/**
 * API route handler for updating an event.
 * Responds to PUT /api/events/[id]
 */
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const correlationId = randomUUID();
	const eventId = params.id;
	const body = await req.json();

	logger.info("API request received to update event.", {
		correlationId,
		context: `PUT /api/events/${eventId}`,
		meta: { eventId, body },
	});

	try {
		const updatedEvent = await eventService.updateEvent(eventId, body, {
			correlationId,
		});
		return createSuccessResponse(updatedEvent);
	} catch (error) {
		logger.error("An unexpected error occurred in updateEvent API.", {
			correlationId,
			context: `PUT /api/events/${eventId}`,
			meta: { error },
		});

		if (error instanceof EventNotFoundError) {
			return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
		}

		return createErrorResponse(
			"An internal server error occurred.",
			"INTERNAL_SERVER_ERROR",
			500,
		);
	}
}

/**
 * API route handler for deleting an event.
 * Responds to DELETE /api/events/[id]
 */
export async function DELETE(
	_: Request,
	{ params }: { params: { id: string } },
) {
	const correlationId = randomUUID();
	const eventId = params.id;

	logger.info("API request received to delete event.", {
		correlationId,
		context: `DELETE /api/events/${eventId}`,
		meta: { eventId },
	});

	try {
		await eventService.deleteEvent(eventId, {
			correlationId,
		});
		return createSuccessResponse({ deleted: true });
	} catch (error) {
		logger.error("An unexpected error occurred in deleteEvent API.", {
			correlationId,
			context: `DELETE /api/events/${eventId}`,
			meta: { error },
		});

		if (error instanceof EventNotFoundError) {
			return createErrorResponse(error.message, "EVENT_NOT_FOUND", 404);
		}

		return createErrorResponse(
			"An internal server error occurred.",
			"INTERNAL_SERVER_ERROR",
			500,
		);
	}
}
