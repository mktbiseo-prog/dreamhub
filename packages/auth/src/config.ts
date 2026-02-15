import { prisma } from "@dreamhub/database";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const isDbAvailable = !!process.env.DATABASE_URL;

export const authConfig: NextAuthConfig = {
  debug: process.env.NODE_ENV === "development",
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dreamhub-dev-secret-do-not-use-in-production",
  // No PrismaAdapter — handle DB operations manually in callbacks
  // to avoid silent adapter errors with Google OAuth
  session: {
    strategy: "jwt",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // Demo mode: no database — accept any valid email/password
        if (!isDbAvailable) {
          return {
            id: `demo-${parsed.data.email}`,
            email: parsed.data.email,
            name: parsed.data.email.split("@")[0],
            image: null,
          };
        }

        let user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        // Auto-create user on first sign-in (sign-up via credentials)
        if (!user) {
          const hashed = await bcrypt.hash(parsed.data.password, 10);
          user = await prisma.user.create({
            data: {
              email: parsed.data.email,
              name: parsed.data.email.split("@")[0],
              hashedPassword: hashed,
            },
          });
        }

        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow credentials sign-in to pass through
      if (account?.provider === "credentials") return true;

      // Google OAuth: manually create/link user in database
      if (account?.provider === "google" && profile?.email && isDbAvailable) {
        try {
          // Find or create user
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name ?? profile.email.split("@")[0],
                image: (profile as Record<string, unknown>).picture as string ?? null,
                emailVerified: new Date(),
              },
            });
          }

          // Ensure Google account is linked
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            },
          });

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token ?? null,
                refresh_token: account.refresh_token ?? null,
                expires_at: account.expires_at ?? null,
                token_type: account.token_type ?? null,
                scope: account.scope ?? null,
                id_token: account.id_token ?? null,
              },
            });
          }

          // Attach DB user id so JWT callback can use it
          user.id = dbUser.id;
          return true;
        } catch (error) {
          console.error("[auth] Google signIn callback error:", error);
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.picture && session.user) {
        session.user.image = token.picture as string;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
      }
      // On initial OAuth sign-in, store profile data in the token
      if (account?.provider === "google" && profile) {
        token.name = profile.name;
        token.email = profile.email;
        token.picture = (profile as Record<string, unknown>).picture as string;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
};
