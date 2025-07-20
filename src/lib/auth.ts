import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/client";

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
        // @ts-expect-error - Augmenting the session object
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
});
