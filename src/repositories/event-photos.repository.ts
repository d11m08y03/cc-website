import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

type EventPhoto = typeof schema.eventPhotos.$inferSelect;
type NewEventPhoto = typeof schema.eventPhotos.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class EventPhotoRepository {
	constructor(private readonly db: DB) { }

	/**
	 * Creates a single new photo record and associates it with an event.
	 * @param photoData The data for the new photo, including eventId and url.
	 * @returns The newly created event photo object.
	 */
	public async create(photoData: NewEventPhoto): Promise<EventPhoto> {
		const [newPhoto] = await this.db
			.insert(schema.eventPhotos)
			.values(photoData)
			.returning();

		return newPhoto;
	}

	/**
	 * Creates multiple photo records in a single batch operation.
	 * This is highly efficient for uploading a photo gallery.
	 * @param photosData An array of new photo data objects.
	 * @returns An array of the newly created event photo objects.
	 */
	public async createMany(photosData: NewEventPhoto[]): Promise<EventPhoto[]> {
		if (photosData.length === 0) {
			return [];
		}
		const newPhotos = await this.db
			.insert(schema.eventPhotos)
			.values(photosData)
			.returning();

		return newPhotos;
	}

	/**
	 * Finds all photos associated with a specific event ID.
	 * @param eventId The ID of the event.
	 * @returns An array of event photo objects.
	 */
	public async findByEventId(eventId: number): Promise<EventPhoto[]> {
		return this.db.query.eventPhotos.findMany({
			where: eq(schema.eventPhotos.eventId, eventId),
			// Order by insertion order
			orderBy: (photos, { asc }) => [asc(photos.id)],
		});
	}

	/**
	 * Updates an existing event photo's data, such as its caption.
	 * @param id The ID of the photo to update.
	 * @param photoData A partial object with the fields to update (e.g., { caption: 'New Caption' }).
	 * @returns The updated event photo object, or undefined if not found.
	 */
	public async update(
		id: number,
		photoData: Partial<NewEventPhoto>,
	): Promise<EventPhoto | undefined> {
		const [updatedPhoto] = await this.db
			.update(schema.eventPhotos)
			.set(photoData)
			.where(eq(schema.eventPhotos.id, id))
			.returning();

		return updatedPhoto;
	}

	/**
	 * Deletes a specific photo by its unique ID.
	 * @param id The ID of the photo to delete.
	 * @returns An object with the ID of the deleted photo, or undefined if not found.
	 */
	public async delete(id: number): Promise<{ deletedId: number } | undefined> {
		const [deletedPhoto] = await this.db
			.delete(schema.eventPhotos)
			.where(eq(schema.eventPhotos.id, id))
			.returning({ deletedId: schema.eventPhotos.id });

		return deletedPhoto;
	}
}
