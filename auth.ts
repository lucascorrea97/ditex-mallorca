import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ─── Shared-password Client Area auth ────────────────────────────────────────
//
// Current model: one password (CLIENT_AREA_PASSWORD env var) shared across all
// authorised clients. Sessions are signed JWTs — no DB tables required.
//
// Migration path to per-client accounts (future, no rework needed):
//   1. Install @auth/drizzle-adapter and pass it as `adapter`.
//   2. Add users / accounts / sessions / verificationTokens tables to db/schema.ts.
//   3. Replace the single CredentialsProvider with email magic-link or a
//      per-client email+password credential — the JWT callback shape below
//      (id, role) stays the same; only the source of `id` changes.

class InvalidPasswordError extends CredentialsSignin {
  code = "invalid_password";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials.password;
        if (typeof password !== "string" || password.trim() === "") return null;
        if (password !== process.env.CLIENT_AREA_PASSWORD) {
          throw new InvalidPasswordError();
        }
        // Shared-access user. `id` is intentionally generic so that per-client
        // accounts can later provide a real user ID without changing the token shape.
        return { id: "shared-client", name: "Cliente D.TEX", email: null };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/area-clientes/acceder",
    error: "/area-clientes/acceder",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Store the minimal identity in the JWT.  When per-client accounts
        // arrive, this is where the real userId and role will live.
        token.id = user.id;
        token.role = "client";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      // Cast to any to attach the role without extending the Session type globally
      (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
});
