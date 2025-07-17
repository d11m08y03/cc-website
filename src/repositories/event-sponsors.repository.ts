import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

type DB = DrizzleD1Database<typeof schema>;

export class EventSponsorRepository {
  constructor(private readonly db: DB) {}

  public async addSponsorToEvent(
    eventId: string,
    sponsorId: string,
  ): Promise<void> {
    await this.db.insert(schema.eventsToSponsors).values({
      event_id: eventId,
      sponsor_id: sponsorId,
    });
  }

  public async removeSponsorFromEvent(
    eventId: string,
    sponsorId: string,
  ): Promise<{ deletedId: string } | undefined> {
    const [deleted] = await this.db
      .delete(schema.eventsToSponsors)
      .where(
        and(
          eq(schema.eventsToSponsors.event_id, eventId),
          eq(schema.eventsToSponsors.sponsor_id, sponsorId),
        ),
      )
      .returning({ deletedId: schema.eventsToSponsors.sponsor_id });
    return deleted;
  }

  public async findSponsorsByEvent(eventId: string) {
    return this.db.query.eventsToSponsors.findMany({
      where: eq(schema.eventsToSponsors.event_id, eventId),
      with: {
        sponsor: true,
      },
    });
  }
}
