import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's MongoDB ID. */
      id?: string;
    } & DefaultSession["user"]
    
    /** The provider used for authentication (e.g., 'github', 'google') */
    provider?: string;
  }

  interface JWT {
    /** The provider used for authentication */
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken` */
  interface JWT {
    /** The provider used for authentication */
    provider?: string;
  }
} 