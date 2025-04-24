import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import connect from "@/lib/db";
import OAuthUser from "@/lib/models/OAuthUser";
import User from "@/lib/models/User";

// Connect to MongoDB first
await connect();

// Define the authOptions
export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if this email already exists in the regular User model
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          // Email already exists in the regular User model
          throw new Error(`This email is already registered. Please use a different email or login method.`);
        }

        // Check if this OAuth user already exists with a different provider
        const existingOAuthUser = await OAuthUser.findOne({ 
          email: user.email, 
          provider: { $ne: account?.provider } 
        });

        if (existingOAuthUser) {
          // Email exists but with a different provider
          throw new Error(`This email is already registered with ${existingOAuthUser.provider}. Please use that provider to login.`);
        }

        // Create or update the OAuth user
        await OAuthUser.findOneAndUpdate(
          { provider: account?.provider, providerId: account?.providerAccountId },
          {
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider,
            providerId: account?.providerAccountId,
            lastLogin: new Date(),
          },
          { upsert: true, new: true }
        );

        return true;
      } catch (error: any) {
        console.error('Authentication error:', error);
        // Store error in session to display it later
        (account as any).error = error.message;
        return `/auth/error?error=${encodeURIComponent(error.message)}`;
      }
    },
    async session({ session, token }) {
      // Add provider information to session if available
      if (token.sub && session.user) {
        try {
          const oauthUser = await OAuthUser.findOne({ 
            providerId: token.sub, 
            provider: token.provider 
          });

          if (oauthUser) {
            session.user.id = oauthUser._id.toString();
            session.provider = oauthUser.provider;
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error);
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      // Store provider in the token
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
  },
};

// Create and export the handler directly
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };