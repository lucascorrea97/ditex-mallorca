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

// The two access roles in the app. "client" gates the public Client Area; "admin" gates
// the internal /admin back-office (ADR-0007). Both are password-based today; when per-client
// accounts arrive, only the source of the user changes — the token/session shape is stable.
type Role = "client" | "admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // ── Shared-password Client Area (CLIENT_AREA_PASSWORD) ──
    Credentials({
      id: "credentials",
      name: "Área de Clientes",
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
        return { id: "shared-client", name: "Cliente D.TEX", email: null, role: "client" };
      },
    }),

    // ── Admin back-office (ADMIN_PASSWORD) ──
    // A separate provider so the admin gate never shares a password with the Client Area.
    // Reuses Auth.js exactly like the client login — we don't hand-roll auth (ADR-0007).
    Credentials({
      id: "admin",
      name: "Administración",
      credentials: {
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials.password;
        if (typeof password !== "string" || password.trim() === "") return null;
        if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
          throw new InvalidPasswordError();
        }
        return { id: "admin", name: "Administración D.TEX", email: null, role: "admin" };
      },
    }),
  ],

  session: { strategy: "jwt" },

  // Trust the deployment host. Vercel preview deployments get dynamic *.vercel.app URLs,
  // which Auth.js otherwise rejects (UntrustedHost -> "problem with the server
  // configuration"). Safe because we control where this runs (Vercel preview/prod).
  trustHost: true,

  pages: {
    signIn: "/area-clientes/acceder",
    error: "/area-clientes/acceder",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Persist identity + role in the JWT. The role comes from whichever provider
        // authorised the sign-in (client vs admin).
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? "client";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      // Cast to attach the role without extending the Session type globally
      (session.user as { role?: Role }).role = token.role as Role;
      return session;
    },
  },
});
