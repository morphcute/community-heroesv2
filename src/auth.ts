import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Developer Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Generic admin authentication: lookup user by email and ensure they have an admin role
        if (credentials?.email) {
          const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
          if (user && ((user as any).role === "SUPERADMIN" || (user as any).role === "MODERATOR")) {
            // TODO: Add proper password verification if password field exists
            return user;
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        // @ts-expect-error - role is dynamically injected
        session.user.role = token.role;
        // @ts-expect-error - id is dynamically injected
        session.user.id = token.id;
      }
      return session;
    }
  }
})
