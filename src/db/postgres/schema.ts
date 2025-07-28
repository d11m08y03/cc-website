import {
	pgTable,
	text,
	timestamp,
	primaryKey,
	boolean,
	integer,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters"

export const users = pgTable("user", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	isAdmin: boolean("isAdmin").default(false),
	isJudge: boolean("isJudge").default(false),
	createdAt: timestamp("created_at").default(sql`now()`), // New createdAt column
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
		createdAt: timestamp("created_at").default(sql`now()`),
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
