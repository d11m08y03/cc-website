import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export type Event = typeof schema.events.$inferSelect;
type NewEvent = typeof schema.events.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class EventRepository {
  constructor(private readonly db: DB) {}

  /**
   * Creates a new event.
   * Note: This only creates the event record itself. Associating organisers, photos, etc.,
   * will be handled by their respective repositories.
   * @param eventData The data for the new event.
   * @returns The newly created event object.
   */
  public async create(eventData: NewEvent): Promise<Event> {
    const [newEvent] = await this.db
      .insert(schema.events)
      .values(eventData)
      .returning();

    return newEvent;
  }

  /**
   * Updates an existing event's data by its ID.
   * @param id The ID of the event to update.
   * @param eventData A partial object containing the fields to update.
   * @returns The updated event object, or undefined if not found.
   */
  public async update(
    id: string,
    eventData: Partial<NewEvent>,
  ): Promise<Event | undefined> {
    const [updatedEvent] = await this.db
      .update(schema.events)
      .set(eventData)
      .where(eq(schema.events.id, id))
      .returning();

    return updatedEvent;
  }

  /**
   * Deletes an event by its ID.
   * Due to 'onDelete: cascade' in the schema, this will also delete all associated
   * event photos, participant links, judge links, and organiser links.
   * @param id The ID of the event to delete.
   * @returns An object containing the ID of the deleted event, or undefined if not deleted.
   */
  public async delete(id: string): Promise<{ deletedId: string } | undefined> {
    const [deletedEvent] = await this.db
      .delete(schema.events)
      .where(eq(schema.events.id, id))
      .returning({ deletedId: schema.events.id });

    return deletedEvent;
  }

  /**
   * Finds a single event by its ID, without any related data.
   * Useful for simple lookups or populating an edit form.
   * @param id The ID of the event.
   * @returns The event object or undefined if not found.
   */
  public async findById(id: string): Promise<Event | undefined> {
    return this.db.query.events.findFirst({
      where: eq(schema.events.id, id),
    });
  }

  /**
   * Finds an event by its ID and includes all its related data:
   * photos, organisers, participants, and judges.
   * This is the primary method for fetching data for an event's detail page.
   * @param id The ID of the event.
   * @returns A rich event object with all relations, or undefined if not found.
   */
  public async findWithDetails(id: string) {
    // Return type is inferred by Drizzle
    return this.db.query.events.findFirst({
      where: eq(schema.events.id, id),
      with: {
        // Fetch all photos from the 'event_photos' table
        eventPhotos: true,
        // Fetch through the junction table to get the full organiser objects
        eventsToOrganisers: {
          with: {
            organiser: true,
          },
        },
        // Fetch through the junction table to get the full user objects for participants
        participants: {
          with: {
            user: {
              // Explicitly select columns to avoid exposing sensitive user data like passwords
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        // Fetch through the junction table to get the full user objects for judges
        judges: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Finds multiple events, ordered by most recent first.
   * Does not include detailed relations for performance.
   * @param options An object for pagination { limit, offset }.
   * @returns An array of event objects.
   */
  public async findMany(options: {
    limit?: number;
    offset?: number;
  }): Promise<Event[]> {
    const { limit = 10, offset = 0 } = options;
    return this.db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.eventDate)],
      limit,
      offset,
    });
  }
}
