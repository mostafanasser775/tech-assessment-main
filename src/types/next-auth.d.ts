import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      companyName?: string | null;
      jobTitle?: string | null;
      notificationSettings?: string | null;
    };
  }
} 