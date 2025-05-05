import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
            username: true,
            bio: true,
            profilePic: true,
            preferredLanguage: true,
            hasOnboarded: true,
            bannerImage: true,
          },
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

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only proceed for Google sign-in
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // If user doesn't exist, create a new one
          if (!existingUser) {
            
            // Generate a random password for OAuth users
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Create new user with STUDENT role by default
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                password: hashedPassword,
                role: Role.STUDENT,
              },
            });
            
          }
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Always fetch the latest user data from DB if we have an email
      const email = user?.email || token.email;
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            username: true,
            bio: true,
            profilePic: true,
            preferredLanguage: true,
            hasOnboarded: true,
            bannerImage: true,
          },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.username = dbUser.username;
          token.bio = dbUser.bio;
          token.profilePic =
            dbUser.profilePic && dbUser.profilePic.startsWith("http")
              ? dbUser.profilePic
              : null;
          token.bannerImage =
            dbUser.bannerImage && dbUser.bannerImage.startsWith("http")
              ? dbUser.bannerImage
              : null;
          token.preferredLanguage = dbUser.preferredLanguage;
          token.hasOnboarded = dbUser.hasOnboarded;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
        session.user.bio = token.bio as string | undefined;
        session.user.profilePic = token.profilePic as string | undefined;
        session.user.bannerImage = token.bannerImage as string | undefined;
        session.user.preferredLanguage = token.preferredLanguage as string | undefined;
        session.user.hasOnboarded = token.hasOnboarded as boolean | undefined;
      }
      return session;
    },
  },
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
      username?: string | null;
      bio?: string | null;
      profilePic?: string | null;
      bannerImage?: string | null;
      preferredLanguage?: string | null;
      hasOnboarded?: boolean;
    };
  }

  interface User {
    id: string;
    role: Role;
    username?: string | null;
    bio?: string | null;
    profilePic?: string | null;
    bannerImage?: string | null;
    preferredLanguage?: string | null;
    hasOnboarded?: boolean;
  }
}

// Update the JWT type
declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id?: string;
    username?: string | null;
    bio?: string | null;
    profilePic?: string | null;
    bannerImage?: string | null;
    preferredLanguage?: string | null;
    hasOnboarded?: boolean;
  }
} 