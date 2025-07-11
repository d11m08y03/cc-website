import {
	sqliteTable,
	text,
	integer,
	primaryKey,
	int,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const appLogs = sqliteTable("app_logs", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	timestamp: integer("timestamp", { mode: "timestamp" })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	level: text("level").notNull(),
	message: text("message").notNull(),
	correlationId: text("correlation_id"),
	context: text("context"),
	meta: text("meta"),
	userId: integer("user_id").references(() => users.id, {
		onDelete: "set null",
	}),
});

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	email: text("email").notNull(),
	hashedPassword: text("hashed_password"),
	isAdmin: int("is_admin", { mode: "boolean" }).default(false).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const organisers = sqliteTable("organisers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	profilePicUrl: text("profile_pic_url"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const events = sqliteTable("events", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	description: text("description").notNull(),
	eventDate: integer("event_date", { mode: "timestamp" }).notNull(),
	location: text("location"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// This table handles the one-to-many relationship: one event -> many photos
export const eventPhotos = sqliteTable("event_photos", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	url: text("url").notNull(),
	caption: text("caption"),
	eventId: integer("event_id")
		.notNull()
		.references(() => events.id, { onDelete: "cascade" }),
});

// Junction table to model the many-to-many relationship between events and organisers
export const eventsToOrganisers = sqliteTable(
	"events_to_organisers",
	{
		eventId: integer("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		organiserId: integer("organiser_id")
			.notNull()
			.references(() => organisers.id, { onDelete: "cascade" }),
	},
	// Composite primary key ensures each event-organiser pair is unique
	(t) => ({
		pk: primaryKey({ columns: [t.eventId, t.organiserId] }),
	}),
);

// Junction table to link Users to Events as Participants
export const eventParticipants = sqliteTable(
	"event_participants",
	{
		eventId: integer("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => ({ pk: primaryKey({ columns: [t.eventId, t.userId] }) }),
);

// Junction table to link Users to Events as Judges
export const eventJudges = sqliteTable(
	"event_judges",
	{
		eventId: integer("event_id")
			.notNull()
			.references(() => events.id, { onDelete: "cascade" }),
		userId: integer("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => ({ pk: primaryKey({ columns: [t.eventId, t.userId] }) }),
);

export const appLogRelations = relations(appLogs, ({ one }) => ({
	user: one(users, {
		fields: [appLogs.userId],
		references: [users.id],
	}),
}));

export const organiserRelations = relations(organisers, ({ many }) => ({
	eventsToOrganisers: many(eventsToOrganisers),
}));

export const eventRelations = relations(events, ({ many }) => ({
	eventPhotos: many(eventPhotos),
	eventsToOrganisers: many(eventsToOrganisers),
}));

export const eventPhotoRelations = relations(eventPhotos, ({ one }) => ({
	event: one(events, {
		fields: [eventPhotos.eventId],
		references: [events.id],
	}),
}));

export const eventsToOrganisersRelations = relations(
	eventsToOrganisers,
	({ one }) => ({
		event: one(events, {
			fields: [eventsToOrganisers.eventId],
			references: [events.id],
		}),
		organiser: one(organisers, {
			fields: [eventsToOrganisers.organiserId],
			references: [organisers.id],
		}),
	}),
);
