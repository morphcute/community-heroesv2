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
        if (credentials?.email === "jimboy@example.com" && credentials?.password === "admin123") {
          let user = await prisma.user.findUnique({ where: { email: "jimboy@example.com" } });
          if (!user) {
            // @ts-ignore - Prisma client needs to be rebuilt by user to catch role
            user = await prisma.user.create({
              data: { email: "jimboy@example.com", name: "Jimboy_Dev", role: "SUPERADMIN" } as any
            });
          } else if ((user as any).role !== "SUPERADMIN") {
            // @ts-ignore
            user = await prisma.user.update({ where: { id: user.id }, data: { role: "SUPERADMIN" }});
          }
          return user;
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
