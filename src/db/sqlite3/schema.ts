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
  timestamp: integer("timestamp", { mode: "number" })
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
  isOrganiser: int("is_organiser", { mode: "boolean" }).default(false).notNull(), // Added isOrganiser
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const accounts = sqliteTable(
  "accounts",
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

// Removed organisers table

export const events = sqliteTable("events", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  start_date: integer("start_date", { mode: "timestamp" }).notNull(),
  end_date: integer("end_date", { mode: "timestamp" }).notNull(),
  location: text("location"),
  poster: text("poster"), // New poster column
  is_active: int("is_active", { mode: "boolean" }).default(true).notNull(), // New isActive column
  created_at: integer("created_at", { mode: "timestamp" })
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

export const sponsors = sqliteTable("sponsors", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  created_at: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const eventsToSponsors = sqliteTable(
  "events_to_sponsors",
  {
    event_id: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    sponsor_id: text("sponsor_id")
      .notNull()
      .references(() => sponsors.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.event_id, t.sponsor_id] }),
  }),
);

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
    userId: text("user_id") // Changed from organiserId to userId
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // References users.id
  },
  // Composite primary key ensures each event-organiser pair is unique
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.userId] }), // Changed organiserId to userId
  }),
);

export const eventsToParticipants = sqliteTable(
  "events_to_participants",
  {
    eventId: text("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.userId] }),
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

export const teamDetails = sqliteTable("team_details", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`(lower(hex(randomblob(16))))`),
  teamName: text("teamName").notNull(),
  members: text("members", { mode: "json" }).notNull(),
  projectFile: text("projectFile"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const appLogRelations = relations(appLogs, ({ one }) => ({
  user: one(users, {
    fields: [appLogs.userId],
    references: [users.id],
  }),
}));

// Removed organiserRelations

export const eventRelations = relations(events, ({ many }) => ({
  eventPhotos: many(eventPhotos),
  eventsToOrganisers: many(eventsToOrganisers),
  eventsToParticipants: many(eventsToParticipants),
  participants: many(eventParticipants),
  judges: many(eventJudges),
  teams: many(eventTeams),
  eventsToSponsors: many(eventsToSponsors),
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
    user: one(users, { // Changed from organiser to user
      fields: [eventsToOrganisers.userId],
      references: [users.id],
    }),
  }),
);

export const eventsToParticipantsRelations = relations(
  eventsToParticipants,
  ({ one }) => ({
    event: one(events, {
      fields: [eventsToParticipants.eventId],
      references: [events.id],
    }),
    user: one(users, {
      fields: [eventsToParticipants.userId],
      references: [users.id],
    }),
  }),
);

export const eventsToSponsorsRelations = relations(
  eventsToSponsors,
  ({ one }) => ({
    event: one(events, {
      fields: [eventsToSponsors.event_id],
      references: [events.id],
    }),
    sponsor: one(sponsors, {
      fields: [eventsToSponsors.sponsor_id],
      references: [sponsors.id],
    }),
  }),
);

export const eventJudgesRelations = relations(eventJudges, ({ one }) => ({
  event: one(events, {
    fields: [eventJudges.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventJudges.userId],
    references: [users.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  appLogs: many(appLogs),
  accounts: many(accounts, { relationName: "user_accounts" }), // Explicit relationName
  sessions: many(sessions, { relationName: "user_sessions" }), // Explicit relationName
  eventParticipants: many(eventParticipants),
  eventJudges: many(eventJudges),
  eventsToOrganisers: many(eventsToOrganisers),
  eventsToParticipants: many(eventsToParticipants),
  teamDetails: many(teamDetails),
}));

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  eventsToSponsors: many(eventsToSponsors),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
    relationName: "user_accounts", // Match relationName
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
    relationName: "user_sessions", // Match relationName
  }),
}));

export const teamDetailsRelations = relations(teamDetails, ({ one }) => ({
  user: one(users, {
    fields: [teamDetails.userId],
    references: [users.id],
  }),
}));