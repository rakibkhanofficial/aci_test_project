// src/types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id?: string;
      username?: string;
      email?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    username?: string;
    email?: string;
    access_token?: string; // 👈 THIS FIXES YOUR ERROR
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user?: {
      id?: string;
      username?: string;
      email?: string;
    };
  }
}
