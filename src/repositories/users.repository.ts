import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class UserRepository {
  constructor(private readonly db: DB) {}

  /**
   * Finds a single user by their unique ID.
   * @param id The numeric ID of the user.
   * @returns The user object or undefined if not found.
   */
  public async findById(id: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
  }

  /**
   * Finds a single user by their unique email address.
   * @param email The email address of the user.
   * @returns The user object or undefined if not found.
   */
  public async findByEmail(email: string): Promise<User | undefined> {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
  }

  /**
   * Retrieves all users from the database.
   * @returns An array of all user objects.
   */
  public async findAll(): Promise<User[]> {
    return this.db.query.users.findMany();
  }

  /**
   * Creates a new user in the database.
   * @param userData The data for the new user.
   * @returns The newly created user object, including the database-generated ID.
   */
  public async create(userData: NewUser): Promise<User> {
    const [newUser] = await this.db
      .insert(schema.users)
      .values(userData)
      .returning();

    return newUser;
  }

  /**
   * Updates an existing user's data by their ID.
   * @param id The ID of the user to update.
   * @param userData A partial object containing the fields to update.
   * @returns The updated user object, or undefined if the user was not found.
   */
  public async update(
    id: string,
    userData: Partial<NewUser>,
  ): Promise<User | undefined> {
    const [updatedUser] = await this.db
      .update(schema.users)
      .set(userData)
      .where(eq(schema.users.id, id))
      .returning();

    return updatedUser;
  }

  /**
   * Deletes a user from the database by their ID.
   * @param id The ID of the user to delete.
   * @returns An object containing the ID of the deleted user, or undefined if no user was deleted.
   */
  public async delete(id: string): Promise<{ deletedId: string } | undefined> {
    const [deletedUser] = await this.db
      .delete(schema.users)
      .where(eq(schema.users.id, id))
      .returning({ deletedId: schema.users.id });

    return deletedUser;
  }
}
