import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

type Organiser = typeof schema.organisers.$inferSelect;
type NewOrganiser = typeof schema.organisers.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class OrganiserRepository {
	constructor(private readonly db: DB) { }

	/**
	 * Finds a single organiser by their unique ID.
	 * @param id The numeric ID of the organiser.
	 * @returns The organiser object or undefined if not found.
	 */
	public async findById(id: number): Promise<Organiser | undefined> {
		return this.db.query.organisers.findFirst({
			where: eq(schema.organisers.id, id),
		});
	}

	/**
	 * Retrieves all organisers from the database.
	 * @returns An array of all organiser objects.
	 */
	public async findAll(): Promise<Organiser[]> {
		return this.db.query.organisers.findMany({
			// Order by name by default
			orderBy: (organisers, { asc }) => [asc(organisers.name)],
		});
	}

	/**
	 * Creates a new organiser in the database.
	 * @param organiserData The data for the new organiser (name and optional profilePicUrl).
	 * @returns The newly created organiser object, including the database-generated ID.
	 */
	public async create(organiserData: NewOrganiser): Promise<Organiser> {
		const [newOrganiser] = await this.db
			.insert(schema.organisers)
			.values(organiserData)
			.returning();

		return newOrganiser;
	}

	/**
	 * Updates an existing organiser's data by their ID.
	 * @param id The ID of the organiser to update.
	 * @param organiserData A partial object containing the fields to update.
	 * @returns The updated organiser object, or undefined if the organiser was not found.
	 */
	public async update(
		id: number,
		organiserData: Partial<NewOrganiser>,
	): Promise<Organiser | undefined> {
		const [updatedOrganiser] = await this.db
			.update(schema.organisers)
			.set(organiserData)
			.where(eq(schema.organisers.id, id))
			.returning();

		return updatedOrganiser;
	}

	/**
	 * Deletes an organiser from the database by their ID.
	 * Note: This will also remove their association from any events due to the 'cascade' rule in the schema.
	 * @param id The ID of the organiser to delete.
	 * @returns An object containing the ID of the deleted organiser, or undefined if no organiser was deleted.
	 */
	public async delete(id: number): Promise<{ deletedId: number } | undefined> {
		const [deletedOrganiser] = await this.db
			.delete(schema.organisers)
			.where(eq(schema.organisers.id, id))
			.returning({ deletedId: schema.organisers.id });

		return deletedOrganiser;
	}
}
