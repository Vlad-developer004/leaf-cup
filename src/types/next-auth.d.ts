import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "CUSTOMER" | "ADMIN";
    firstName?: string;
    lastName?: string;
  }

  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "ADMIN";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CUSTOMER" | "ADMIN";
  }
}
