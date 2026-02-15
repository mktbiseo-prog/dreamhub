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

// Only register Google if credentials are provided
const providers: NextAuthConfig["providers"] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    ...providers,
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
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },
};
