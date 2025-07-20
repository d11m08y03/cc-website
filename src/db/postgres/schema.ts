import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters"

export const appLogs = pgTable("app_logs", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => sql`gen_random_uuid()`), // Use gen_random_uuid() for PostgreSQL
  timestamp: timestamp("timestamp", { mode: "date" })
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

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
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
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)
 
export const authenticators = pgTable(
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
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

export const events = pgTable("events", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => sql`gen_random_uuid()`), // Use gen_random_uuid() for PostgreSQL
  name: text("name").notNull(),
  description: text("description").notNull(),
  start_date: timestamp("start_date", { mode: "date" }).notNull(),
  end_date: timestamp("end_date", { mode: "date" }).notNull(),
  location: text("location"),
  poster: text("poster"),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const eventTeams = pgTable("event_teams", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => sql`gen_random_uuid()`), // Use gen_random_uuid() for PostgreSQL
  name: text("name").notNull(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const sponsors = pgTable("sponsors", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => sql`gen_random_uuid()`), // Use gen_random_uuid() for PostgreSQL
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  created_at: timestamp("created_at", { mode: "date" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const eventsToSponsors = pgTable(
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

export const eventPhotos = pgTable("event_photos", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => sql`gen_random_uuid()`), // Use gen_random_uuid() for PostgreSQL
  url: text("url").notNull(),
  caption: text("caption"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
});


export const teamDetails = pgTable(
  "team_details",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => sql`gen_random_uuid()`), // Use gen_random_uuid() for PostgreSQL
    teamName: text("team_name").notNull(),
    projectFile: text("project_file"),
    projectFileName: text("project_file_name"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    approvalStatus: text("approval_status").notNull().default("pending"),
  },
  (table) => {
    return {
      userIdIdx: uniqueIndex("team_details_user_id_idx").on(table.userId),
    };
  },
);

export const teamMembers = pgTable("team_members", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => sql`gen_random_uuid()`),
  teamId: text("team_id")
    .notNull()
    .references(() => teamDetails.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role"), // e.g., "leader", "member"
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  contactNumber: text("contact_number").notNull(),
  foodPreference: text("food_preference").notNull(),
  tshirtSize: text("tshirt_size").notNull(),
  allergies: text("allergies"),
});


export const eventPhotoRelations = relations(eventPhotos, ({ one }) => ({
  event: one(events, {
    fields: [eventPhotos.eventId],
    references: [events.id],
  }),
}));

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

export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  eventsToSponsors: many(eventsToSponsors),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
    relationName: "user_accounts",
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
    relationName: "user_sessions",
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  appLogs: many(appLogs),
  accounts: many(accounts, { relationName: "user_accounts" }),
  sessions: many(sessions, { relationName: "user_sessions" }),
  teamDetails: many(teamDetails),
}));

export const teamDetailsRelations = relations(teamDetails, ({ one, many }) => ({
  user: one(users, {
    fields: [teamDetails.userId],
    references: [users.id],
  }),
  teamMembers: many(teamMembers),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  teamDetails: one(teamDetails, {
    fields: [teamMembers.teamId],
    references: [teamDetails.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));
