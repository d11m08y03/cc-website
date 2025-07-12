import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

type EventParticipant = typeof schema.eventParticipants.$inferSelect;
type NewEventParticipant = typeof schema.eventParticipants.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class EventParticipantRepository {
  constructor(private readonly db: DB) {}

  /**
   * Creates a link between an event and a user, registering them as a participant.
   * Can optionally assign them to a team at the same time.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to add as a participant.
   * @param teamId Optional ID of the team to assign the participant to.
   * @returns The newly created link object.
   */
  public async addParticipantToEvent(
    eventId: string,
    userId: string,
    teamId?: string | null,
  ): Promise<EventParticipant> {
    const [newLink] = await this.db
      .insert(schema.eventParticipants)
      .values({ eventId, userId, teamId: teamId ?? null })
      .returning();

    return newLink;
  }

  /**
   * Removes a link between an event and a user, un-registering them from the event entirely.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to remove.
   * @returns The deleted link object, or undefined if the link did not exist.
   */
  public async removeParticipantFromEvent(
    eventId: string,
    userId: string,
  ): Promise<EventParticipant | undefined> {
    const [deletedLink] = await this.db
      .delete(schema.eventParticipants)
      .where(
        and(
          eq(schema.eventParticipants.eventId, eventId),
          eq(schema.eventParticipants.userId, userId),
        ),
      )
      .returning();

    return deletedLink;
  }

  /**
   * Finds all participant associations for a given event.
   * @param eventId The ID of the event.
   * @returns An array of link objects containing eventId, userId, and teamId.
   */
  public async findParticipantsByEvent(
    eventId: string,
  ): Promise<EventParticipant[]> {
    return this.db.query.eventParticipants.findMany({
      where: eq(schema.eventParticipants.eventId, eventId),
    });
  }

  /**
   * Assigns an existing event participant to a specific team.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to assign.
   * @param teamId The ID of the team to assign the user to.
   * @returns The updated link object, or undefined if the participant was not found.
   */
  public async assignParticipantToTeam(
    eventId: string,
    userId: string,
    teamId: string,
  ): Promise<EventParticipant | undefined> {
    const [updatedLink] = await this.db
      .update(schema.eventParticipants)
      .set({ teamId })
      .where(
        and(
          eq(schema.eventParticipants.eventId, eventId),
          eq(schema.eventParticipants.userId, userId),
        ),
      )
      .returning();
    return updatedLink;
  }

  /**
   * Removes a participant from their team, making them a solo participant.
   * This action does not un-register them from the event itself.
   * @param eventId The ID of the event.
   * @param userId The ID of the user to remove from a team.
   * @returns The updated link object, or undefined if the participant was not found.
   */
  public async removeParticipantFromTeam(
    eventId: string,
    userId: string,
  ): Promise<EventParticipant | undefined> {
    const [updatedLink] = await this.db
      .update(schema.eventParticipants)
      .set({ teamId: null })
      .where(
        and(
          eq(schema.eventParticipants.eventId, eventId),
          eq(schema.eventParticipants.userId, userId),
        ),
      )
      .returning();
    return updatedLink;
  }
}
