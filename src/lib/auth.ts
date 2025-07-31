import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import { users } from "@/db/postgres/schema";
import { eq } from "drizzle-orm";

export const handlers = NextAuth({
	adapter: DrizzleAdapter(db),

	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
	],

	// Use JWTs for session management.
	session: {
		strategy: "jwt",
	},

	callbacks: {
		async jwt({ token, user }) {
			// On initial sign-in, the `user` object is available.
			if (user) {
				token.id = user.id; // Persist the user's ID in the token
				// @ts-expect-error - Augmenting the user object
				token.isAdmin = user.isAdmin; // Persist the isAdmin flag
				// @ts-expect-error - Augmenting the user object
				token.isJudge = user.isJudge; // Persist the isJudge flag
			}

			// Refresh the token with the latest user data from the database
			if (token.id) {
				const dbUser = await db.query.users.findFirst({
					where: eq(users.id, token.id as string),
				});
				if (dbUser) {
					token.isAdmin = dbUser.isAdmin;
					token.isJudge = dbUser.isJudge;
				}
			}

			return token;
		},

		/**
		 * This callback is called whenever a session is checked.
		 * We can use it to pass our custom token properties to the client-side session object.
		 */
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.isAdmin = token.isAdmin as boolean;
				session.user.isJudge = token.isJudge as boolean;
			}
			return session;
		},
	},
});
