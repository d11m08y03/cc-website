import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";
import { logger } from "@/services/app-logs.service";
import { randomUUID } from "crypto";
import type { Adapter } from "next-auth/adapters";

/**
 * This is the central configuration for NextAuth.js.
 * It is used in the [...nextauth] route handler and for server-side session access.
 */
export const {
  handlers, // The route handlers for GET and POST
  auth, // The main function to get the session on the server
  signIn, // Server-side function to initiate sign-in
  signOut, // Server-side function to initiate sign-out
} = NextAuth({
  adapter: DrizzleAdapter(db) as Adapter,

  // Configure authentication providers.
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Define the session management strategy.
  session: {
    strategy: "jwt",
  },

  // Callbacks for customizing JWTs and sessions.
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, add custom properties to the token.
      if (user) {
        token.id = user.id;
        // @ts-ignore - Augmenting the user object for our custom isAdmin flag
        token.isAdmin = user.isAdmin;
      }
      return token;
    },

    async session({ session, token }) {
      // Pass the custom properties from the token to the client-side session.
      if (session.user) {
        // @ts-ignore - Augmenting the session object
        session.user.id = token.id as string;
        // @ts-ignore - Augmenting the session object
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },

  // Events for logging key authentication lifecycle events.
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
      if (message.token) {
        logger.info("User signed out.", {
          correlationId: randomUUID(),
          context: "NextAuth:signOut",
          userId: message.token.id as string,
        });
      }
    },
  },
});
