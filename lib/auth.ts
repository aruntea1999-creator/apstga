import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

if (process.env.NODE_ENV === "production") {
  // TEMP: boolean-only diagnostic. Remove after Vercel env vars are confirmed.
  console.log("[auth-config]", {
    AUTH_SECRET_PRESENT: Boolean(process.env.AUTH_SECRET),
    NEXTAUTH_SECRET_PRESENT: Boolean(process.env.NEXTAUTH_SECRET),
    RESOLVED_SECRET_PRESENT: Boolean(
      process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    ),
    AUTH_URL_PRESENT: Boolean(process.env.AUTH_URL),
    NEXTAUTH_URL_PRESENT: Boolean(process.env.NEXTAUTH_URL),
    DATABASE_URL_PRESENT: Boolean(process.env.DATABASE_URL),
    VERCEL: Boolean(process.env.VERCEL),
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  // Trust the Host header from the hosting proxy (Vercel, etc.).
  trustHost: true,
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
