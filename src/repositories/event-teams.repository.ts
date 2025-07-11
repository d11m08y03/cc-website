import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

type EventTeam = typeof schema.eventTeams.$inferSelect;
type NewEventTeam = typeof schema.eventTeams.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

/**
 * Repository for handling all database operations related to the 'event_teams' table.
 */
export class EventTeamRepository {
	constructor(private readonly db: DB) { }

	/**
	 * Creates a new team for a specific event.
	 * @param teamData The data for the new team, including eventId and name.
	 * @returns The newly created team object.
	 */
	public async create(teamData: NewEventTeam): Promise<EventTeam> {
		const [newTeam] = await this.db
			.insert(schema.eventTeams)
			.values(teamData)
			.returning();
		return newTeam;
	}

	/**
	 * Finds a single team by its unique ID.
	 * @param id The numeric ID of the team.
	 * @returns The team object or undefined if not found.
	 */
	public async findById(id: number): Promise<EventTeam | undefined> {
		return this.db.query.eventTeams.findFirst({
			where: eq(schema.eventTeams.id, id),
		});
	}

	/**
	 * Finds all teams associated with a specific event.
	 * @param eventId The ID of the event.
	 * @returns An array of team objects for that event, ordered by name.
	 */
	public async findByEventId(eventId: number): Promise<EventTeam[]> {
		return this.db.query.eventTeams.findMany({
			where: eq(schema.eventTeams.eventId, eventId),
			orderBy: (teams, { asc }) => [asc(teams.name)],
		});
	}

	/**
	 * Updates an existing team's data, such as its name.
	 * @param id The ID of the team to update.
	 * @param teamData A partial object containing the fields to update.
	 * @returns The updated team object, or undefined if the team was not found.
	 */
	public async update(
		id: number,
		teamData: Partial<NewEventTeam>,
	): Promise<EventTeam | undefined> {
		const [updatedTeam] = await this.db
			.update(schema.eventTeams)
			.set(teamData)
			.where(eq(schema.eventTeams.id, id))
			.returning();
		return updatedTeam;
	}

	/**
	 * Deletes a team from the database.
	 * Note: Due to the 'onDelete: set null' rule in the schema, this will not remove participants
	 * from the event, but will set their 'teamId' to NULL.
	 * @param id The ID of the team to delete.
	 * @returns An object containing the ID of the deleted team, or undefined if not deleted.
	 */
	public async delete(id: number): Promise<{ deletedId: number } | undefined> {
		const [deletedTeam] = await this.db
			.delete(schema.eventTeams)
			.where(eq(schema.eventTeams.id, id))
			.returning({ deletedId: schema.eventTeams.id });
		return deletedTeam;
	}
}
