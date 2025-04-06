import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        console.log('User from DB:', user);
        console.log('User role from DB:', user.role);
        console.log('Role type from DB:', typeof user.role);

        // Ensure the role is a valid Role enum value
        if (!Object.values(Role).includes(user.role)) {
          throw new Error("Invalid user role");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      console.log('JWT Callback - User:', user);
      console.log('JWT Callback - Token before:', token);
      
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      console.log('JWT Callback - Token after:', token);
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      console.log('Session Callback - Token:', token);
      console.log('Session Callback - Session before:', session);
      
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      
      console.log('Session Callback - Session after:', session);
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// Update the session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    id: string;
    role: Role;
  }
} 