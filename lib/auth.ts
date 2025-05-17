import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only proceed for Google sign-in
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user doesn't exist, create a new one
          if (!existingUser && user.email) {
            // Generate a random password since we won't use it for OAuth users
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Create new user with STUDENT role by default
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                password: hashedPassword,
                role: "STUDENT",
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
      // Initial sign in
      if (account && user) {
        // For Google sign in, fetch the user from DB to get role
        if (account.provider === "google") {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } else {
          // For credentials, we already have the user data
          token.id = user.id;
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        // Fetch additional user data from database
        const userData = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            role: true,
            bio: true,
            profilePic: true,
            username: true,
            createdAt: true
          }
        });
        
        if (userData) {
          return {
            ...session,
            user: {
              ...session.user,
              id: userData.id,
              role: userData.role,
              bio: userData.bio,
              profilePic: userData.profilePic,
              username: userData.username,
              joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : undefined
            },
          };
        }
      }
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
  },
}; 