import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { consumeAdminInvite } from "@/lib/admin/admin-invites";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          firstName: profile.given_name ?? "",
          lastName: profile.family_name ?? "",
          image: profile.picture,
          role: "CUSTOMER",
        };
      },
    }),
  ],
  events: {

    createUser: async ({ user }) => {
      if (user.id && user.email) {
        await consumeAdminInvite(user.id, user.email);
      }
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.name = user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
      }
      return token;
    },
    session: async (params) => {
      const session = await authConfig.callbacks.session(params);
      if (session.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { firstName: true, lastName: true, image: true },
        });
        if (user) {
          session.user.name = `${user.firstName} ${user.lastName}`.trim();
          session.user.image = user.image;
        }
      }
      return session;
    },
  },
});
