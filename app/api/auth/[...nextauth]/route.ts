import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { supabaseAuth } from "@/lib/supabase/client";



const credentialsProvider = Credentials({
  name: "Credentials",

  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },

  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.user) {
      console.log("Login failed:", error?.message);
      return null;
    }

    return {
      id: data.user.id,
      email: data.user.email,
    };
  },
});

export const authOptions = {
  providers: [credentialsProvider],
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.sub!;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
 export { handler as GET, handler as POST };