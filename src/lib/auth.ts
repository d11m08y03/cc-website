import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

export const handlers = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),

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
        // @ts-ignore - Augmenting the user object
        token.isAdmin = user.isAdmin; // Persist the isAdmin flag
      }
      return token;
    },

    /**
     * This callback is called whenever a session is checked.
     * We can use it to pass our custom token properties to the client-side session object.
     */
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore - Augmenting the session object
        session.user.id = token.id as string;
        // @ts-ignore - Augmenting the session object
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },

  // Add logging for key authentication lifecycle events.
  events: {
    async signIn(message) {
      logger.info("User signed in successfully.", {
        correlationId: randomUUID(),
        context: "NextAuth:signIn",
        userId: message.user.id,
        meta: { email: message.user.email },
      });
    },

    async signOut(message) {
      logger.info("User signed out.", {
        correlationId: randomUUID(),
        userId: message.token.id as string,
        context: "NextAuth:signOut",
      });
    },
  },
});

export { handlers as GET, handlers as POST };
