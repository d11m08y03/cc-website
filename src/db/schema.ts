import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  int,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const appLogs = sqliteTable("app_logs", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  timestamp: integer("timestamp", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  correlationId: text("correlation_id"),
  context: text("context"),
  meta: text("meta"),
  userId: text("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  hashedPassword: text("hashed_password"),
  isAdmin: int("is_admin", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const verificationTokens = sqliteTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const organisers = sqliteTable("organisers", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  profilePicUrl: text("profile_pic_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  eventDate: integer("event_date", { mode: "timestamp" }).notNull(),
  location: text("location"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const eventTeams = sqliteTable("event_teams", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// This table handles the one-to-many relationship: one event -> many photos
export const eventPhotos = sqliteTable("event_photos", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  url: text("url").notNull(),
  caption: text("caption"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
});

// Junction table to model the many-to-many relationship between events and organisers
export const eventsToOrganisers = sqliteTable(
  "events_to_organisers",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    organiserId: text("organiser_id")
      .notNull()
      .references(() => organisers.id, { onDelete: "cascade" }),
  },
  // Composite primary key ensures each event-organiser pair is unique
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.organiserId] }),
  }),
);

export const eventParticipants = sqliteTable(
  "event_participants",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    teamId: text("team_id").references(() => eventTeams.id, {
      onDelete: "set null",
    }), // Updated reference here
  },
  (t) => ({ pk: primaryKey({ columns: [t.eventId, t.userId] }) }),
);

// Junction table to link Users to Events as Participants
export const eventParticipantsRelations = relations(
  eventParticipants,
  ({ one }) => ({
    event: one(events, {
      fields: [eventParticipants.eventId],
      references: [events.id],
    }),
    user: one(users, {
      fields: [eventParticipants.userId],
      references: [users.id],
    }),
    team: one(eventTeams, {
      // Updated relation to point to `eventTeams`
      fields: [eventParticipants.teamId],
      references: [eventTeams.id],
    }),
  }),
);

// Junction table to link Users to Events as Judges
export const eventJudges = sqliteTable(
  "event_judges",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
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
  participants: many(eventParticipants),
  judges: many(eventJudges),
  teams: many(eventTeams),
}));

export const eventTeamRelations = relations(eventTeams, ({ one, many }) => ({
  event: one(events, {
    fields: [eventTeams.eventId],
    references: [events.id],
  }),
  members: many(eventParticipants),
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
