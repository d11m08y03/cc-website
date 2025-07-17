import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export type Sponsor = typeof schema.sponsors.$inferSelect;
export type NewSponsor = typeof schema.sponsors.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class SponsorRepository {
  constructor(private readonly db: DB) {}

  public async create(sponsorData: NewSponsor): Promise<Sponsor> {
    const [newSponsor] = await this.db
      .insert(schema.sponsors)
      .values(sponsorData)
      .returning();
    return newSponsor;
  }

  public async findById(id: string): Promise<Sponsor | undefined> {
    return this.db.query.sponsors.findFirst({
      where: eq(schema.sponsors.id, id),
    });
  }

  public async findMany(): Promise<Sponsor[]> {
    return this.db.query.sponsors.findMany();
  }

  public async update(
    id: string,
    sponsorData: Partial<NewSponsor>,
  ): Promise<Sponsor | undefined> {
    const [updatedSponsor] = await this.db
      .update(schema.sponsors)
      .set(sponsorData)
      .where(eq(schema.sponsors.id, id))
      .returning();
    return updatedSponsor;
  }

  public async delete(id: string): Promise<{ deletedId: string } | undefined> {
    const [deletedSponsor] = await this.db
      .delete(schema.sponsors)
      .where(eq(schema.sponsors.id, id))
      .returning({ deletedId: schema.sponsors.id });
    return deletedSponsor;
  }
}
