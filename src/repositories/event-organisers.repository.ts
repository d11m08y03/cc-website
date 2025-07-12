import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

type EventToOrganiser = typeof schema.eventsToOrganisers.$inferSelect;
type NewEventToOrganiser = typeof schema.eventsToOrganisers.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class EventOrganiserRepository {
  constructor(private readonly db: DB) {}

  /**
   * Creates a link between an event and an organiser.
   * @param eventId The ID of the event.
   * @param organiserId The ID of the organiser to associate with the event.
   * @returns The newly created link object.
   */
  public async addOrganiserToEvent(
    eventId: string,
    organiserId: string,
  ): Promise<EventToOrganiser> {
    const [newLink] = await this.db
      .insert(schema.eventsToOrganisers)
      .values({ eventId, organiserId })
      .returning();

    return newLink;
  }

  /**
   * Removes a link between an event and an organiser.
   * @param eventId The ID of the event.
   * @param organiserId The ID of the organiser to disassociate from the event.
   * @returns The deleted link object, or undefined if the link did not exist.
   */
  public async removeOrganiserFromEvent(
    eventId: string,
    organiserId: string,
  ): Promise<EventToOrganiser | undefined> {
    const [deletedLink] = await this.db
      .delete(schema.eventsToOrganisers)
      .where(
        and(
          eq(schema.eventsToOrganisers.eventId, eventId),
          eq(schema.eventsToOrganisers.organiserId, organiserId),
        ),
      )
      .returning();

    return deletedLink;
  }

  /**
   * Finds all organiser associations for a given event.
   * This is useful for getting just the IDs without fetching full organiser details.
   * @param eventId The ID of the event.
   * @returns An array of link objects.
   */
  public async findOrganisersByEvent(
    eventId: string,
  ): Promise<EventToOrganiser[]> {
    return this.db.query.eventsToOrganisers.findMany({
      where: eq(schema.eventsToOrganisers.eventId, eventId),
    });
  }
}
