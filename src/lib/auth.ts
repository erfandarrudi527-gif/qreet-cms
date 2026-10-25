import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Rate limiting & security tracking for authentication attempts
const ATTEMPTS = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lock on repeated wrong passwords

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Qreet CMS",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const normalizedEmail = credentials.email.trim().toLowerCase();

        // Security check: brute-force rate limit protection
        const attempt = ATTEMPTS.get(normalizedEmail);
        const now = Date.now();
        if (attempt && attempt.count >= MAX_ATTEMPTS) {
          if (now - attempt.lastAttempt < LOCKOUT_MS) {
            console.warn(`[Security Rate Limit] Locked out email: ${normalizedEmail}`);
            throw new Error("Too many failed attempts. Account temporarily locked for 15 minutes.");
          } else {
            // Lockout window expired, reset counter
            ATTEMPTS.delete(normalizedEmail);
          }
        }

        // Hardcoded standard admin credentials (known & shared for initial setup)
        const primaryAdminEmail = (process.env.ADMIN_EMAIL || "admin@qreet.com").toLowerCase();
        const primaryAdminPassword = process.env.ADMIN_PASSWORD || "admin12345";

        if (
          normalizedEmail === primaryAdminEmail &&
          credentials.password === primaryAdminPassword
        ) {
          ATTEMPTS.delete(normalizedEmail);
          return { id: "admin-1", email: primaryAdminEmail, name: "Erfan", role: "admin" };
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          // Verify with salted bcrypt hash
          if (user && user.passwordHash && (await bcrypt.compare(credentials.password, user.passwordHash))) {
            ATTEMPTS.delete(normalizedEmail);
            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }
        } catch (err) {
          console.error("Authorize error:", err);
        }

        // Record failed attempt for rate limiting
        const currentCount = (attempt?.count || 0) + 1;
        ATTEMPTS.set(normalizedEmail, { count: currentCount, lastAttempt: now });
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role ?? "admin";
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = (token.role as string) ?? "admin";
      }
      return session;
    },
  },
};
