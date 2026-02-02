import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { createClient } from "@supabase/supabase-js";
import { create } from "domain";
import { SupabaseServerClient } from "@/lib/supabase/server";

/**
 * Admin client for NextAuth adapter
 * This doesn't need cookies as it uses service role key
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Supabase Adapter
 * Handles users, accounts, sessions tables
 */
const adapter = SupabaseAdapter({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

/**
 * Credentials Provider
 * Uses Supabase Auth internally
 */
const credentialsProvider = Credentials({
  name: "Credentials",

  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },

  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    try {
      // 1 Try login
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      // 2 If user does not exist  SIGN UP
      if (error?.code === "invalid_credentials") {
        const { data: signupData, error: signupError } =
          await supabaseAdmin.auth.signUp({
            email: credentials.email,
            password: credentials.password,
          });

        if (signupError || !signupData.user) {
          console.log("Signup error:", signupError);
          return null;
        }

        
      
        console.log("Creating profile for user:", signupData.user.id);
        const supabase = await SupabaseServerClient()
        const { data: profileData, error: profileError } = await supabase
        .from("users")
        .insert(
          {
            id: signupData.user.id,
            email: signupData.user.email,
            name: signupData.user.email?.split("@")[0],
            created_at: new Date().toISOString(),
          }
        );

    if (profileError) {
      console.log("Profile creation error:", profileError);
      return null;
    }

    if (profileData) {
      console.log("Profile data:", profileData);
    } 
    
        return {
          id: signupData.user.id,
          email: signupData.user.email,
          name: signupData.user.email?.split("@")[0],
        };
      }

      
      if (error || !data.user) {
        console.error("Login error:", error);
        return null;
      }

      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.email?.split("@")[0],
      };
    } catch (err) {
      console.log("Authorize error:", err);
      return null;
    }
  },
});

/**
 * NextAuth Configuration
 */
export const authOptions = {
  adapter,
  providers: [credentialsProvider],
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/signup",
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };