import { PrismaAdapter } from "@auth/prisma-adapter";
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

// Build providers list
const oauthProviders: NextAuthConfig["providers"] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Allow linking Google account to existing user with same email
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authConfig: NextAuthConfig = {
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dreamhub-dev-secret-do-not-use-in-production",
  ...(isDbAvailable ? { adapter: PrismaAdapter(prisma) } : {}),
  session: {
    strategy: "jwt",
  },
  providers: [
    ...oauthProviders,
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
    async signIn({ account, profile }) {
      // Allow credentials sign-in to pass through
      if (account?.provider === "credentials") return true;
      // For OAuth (Google), ensure we have an email
      if (account?.provider === "google") {
        return !!profile?.email;
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.picture && session.user) {
        session.user.image = token.picture;
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
        token.picture = profile.picture as string;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
};
