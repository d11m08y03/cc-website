import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import * as schema from "@/db/schema";

type Log = typeof schema.appLogs.$inferSelect;
type NewLog = typeof schema.appLogs.$inferInsert;
type DB = DrizzleD1Database<typeof schema>;

export class AppLogRepository {
	constructor(private readonly db: DB) { }

	/**
	 * Creates a new log entry in the database.
	 * @param logData The data for the new log entry.
	 * @returns The newly created log object.
	 */
	public async create(logData: NewLog): Promise<Log> {
		const [newLog] = await this.db
			.insert(schema.appLogs)
			.values(logData)
			.returning();

		return newLog;
	}

	/**
	 * Finds all logs associated with a specific correlation ID, ordered chronologically.
	 * This is the key method for tracing a single request's lifecycle.
	 * @param correlationId The unique ID for the request trace.
	 * @returns An array of log objects.
	 */
	public async findByCorrelationId(correlationId: string): Promise<Log[]> {
		return this.db.query.appLogs.findMany({
			where: eq(schema.appLogs.correlationId, correlationId),
			orderBy: (logs, { asc }) => [asc(logs.timestamp)],
		});
	}

	/**
	 * A flexible method to find logs based on a set of optional criteria.
	 * @param options An object containing filters like userId, level, and pagination.
	 * @returns An array of log objects matching the criteria.
	 */
	public async find(options: {
		userId?: number;
		level?: string;
		limit?: number;
		offset?: number;
	}): Promise<Log[]> {
		const { userId, level, limit = 50, offset } = options;
		const conditions = [];

		if (userId) {
			conditions.push(eq(schema.appLogs.userId, userId));
		}
		if (level) {
			conditions.push(eq(schema.appLogs.level, level));
		}

		return this.db.query.appLogs.findMany({
			where: conditions.length > 0 ? and(...conditions) : undefined,
			orderBy: (logs, { desc }) => [desc(logs.timestamp)],
			limit,
			offset,
		});
	}
}
