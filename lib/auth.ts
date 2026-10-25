import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const login = credentials.email as string;
        const pass = credentials.password as string;

        const { verifyAdminCredentials } = await import("@/lib/admin-config");
        const adminMatch = verifyAdminCredentials(login, pass);
        if (adminMatch) {
          return {
            id: "admin",
            name: "Administrator",
            email: "admin@apstga.org",
            role: "SUPER_ADMIN",
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: login },
        });

        if (!user || !user.password || !user.active) return null;

        const isValid = await compare(pass, user.password);

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as unknown as Record<string, unknown>;
        sUser.role = token.role ?? "";
        sUser.id = token.id ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
