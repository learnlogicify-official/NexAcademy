import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const prisma = new PrismaClient();

// Add GitHub user profile type
interface GitHubProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  name: string;
  email: string;
}

// Custom User type with GitHub fields
interface UserWithGitHub {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  resetToken: string | null;
  resetTokenExp: Date | null;
  bio: string | null;
  hasOnboarded: boolean;
  preferredLanguage: string | null;
  profilePic: string | null;
  username: string | null;
  bannerImage: string | null;
  githubUsername: string | null;
  githubAccessToken: string | null;
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
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
    async signIn({ user, account, profile }) {
      // Handle both Google and GitHub sign-in
      if ((account?.provider === "google" || account?.provider === "github") && user.email) {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          }) as UserWithGitHub | null;

          // If user doesn't exist, create a new one
          if (!existingUser) {
            // Generate a random password for OAuth users
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            // Get GitHub username if available
            const githubUsername = account.provider === "github" && profile 
              ? (profile as GitHubProfile).login || user.name 
              : undefined;

            // Create new user with STUDENT role by default
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                password: hashedPassword,
                role: Role.STUDENT,
                ...(githubUsername && { githubUsername }),
              } as any, // Type assertion needed due to custom fields
            });
          } 
          
          // For GitHub, always update the access token
          if (account.provider === "github" && account.access_token) {
            // Get GitHub username if available
            const githubUsername = profile ? (profile as GitHubProfile).login || user.name : undefined;
            
            // Update user with GitHub token and username
            await prisma.user.update({
              where: { email: user.email },
              data: {
                githubAccessToken: account.access_token,
                ...(githubUsername && !existingUser?.githubUsername && { githubUsername }),
              } as any, // Type assertion needed due to custom fields
            });
          }
        } catch (error) {
          console.error("Error during OAuth sign in:", error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // Always fetch the latest user data from DB if we have an email
      const email = user?.email || token.email;
      if (email) {
        try {
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
              // Add as custom field
              // We'll cast the result after
            },
          });
          
          // Cast to include our custom fields
          const userWithGitHub = dbUser as (typeof dbUser & { githubUsername?: string | null });
          
          if (userWithGitHub) {
            token.id = userWithGitHub.id;
            token.role = userWithGitHub.role;
            token.username = userWithGitHub.username;
            token.bio = userWithGitHub.bio;
            token.profilePic =
              userWithGitHub.profilePic && userWithGitHub.profilePic.startsWith("http")
                ? userWithGitHub.profilePic
                : null;
            token.bannerImage =
              userWithGitHub.bannerImage && userWithGitHub.bannerImage.startsWith("http")
                ? userWithGitHub.bannerImage
                : null;
            token.preferredLanguage = userWithGitHub.preferredLanguage;
            token.hasOnboarded = userWithGitHub.hasOnboarded;
            token.githubUsername = userWithGitHub.githubUsername;
          }
        } catch (err) {
          console.error("Error fetching user data for JWT:", err);
        }
      }
      
      // Store the GitHub access token when signing in with GitHub
      if (account?.provider === 'github' && account.access_token) {
        token.githubAccessToken = account.access_token;
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
        session.user.githubUsername = token.githubUsername as string | undefined;
        // Don't include the access token in the session for security reasons
      }
      return session;
    }
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
      githubUsername?: string | null;
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
    githubUsername?: string | null;
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
    githubAccessToken?: string | null;
    githubUsername?: string | null;
  }
} 