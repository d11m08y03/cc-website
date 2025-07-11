import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

type EventJudge = typeof schema.eventJudges.$inferSelect;
type NewEventJudge = typeof schema.eventJudges.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class EventJudgeRepository {
	constructor(private readonly db: DB) { }

	/**
	 * Creates a link between an event and a user, assigning them as a judge.
	 * @param eventId The ID of the event.
	 * @param userId The ID of the user to add as a judge.
	 * @returns The newly created link object.
	 */
	public async addJudgeToEvent(
		eventId: number,
		userId: number,
	): Promise<EventJudge> {
		const [newLink] = await this.db
			.insert(schema.eventJudges)
			.values({ eventId, userId })
			.returning();

		return newLink;
	}

	/**
	 * Removes a link between an event and a user, revoking their judge role.
	 * @param eventId The ID of the event.
	 * @param userId The ID of the user to remove.
	 * @returns The deleted link object, or undefined if the link did not exist.
	 */
	public async removeJudgeFromEvent(
		eventId: number,
		userId: number,
	): Promise<EventJudge | undefined> {
		const [deletedLink] = await this.db
			.delete(schema.eventJudges)
			.where(
				and(
					eq(schema.eventJudges.eventId, eventId),
					eq(schema.eventJudges.userId, userId),
				),
			)
			.returning();

		return deletedLink;
	}

	/**
	 * Finds all judge associations for a given event.
	 * @param eventId The ID of the event.
	 * @returns An array of link objects containing eventId and userId.
	 */
	public async findJudgesByEvent(eventId: number): Promise<EventJudge[]> {
		return this.db.query.eventJudges.findMany({
			where: eq(schema.eventJudges.eventId, eventId),
		});
	}
}
