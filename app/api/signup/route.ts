// app/api/signup/route.ts (Next.js App Router)
import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { SupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();
        
        console.log("Signup data:", email, password, name);

        const hashedPassword =  bcrypt.hashSync(password, 10);

        const supabase = await SupabaseServer();

      
        const { data, error } = await supabase
          .from("users")
          .insert([{ email, password: hashedPassword, name }]);
      
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      
        return NextResponse.json({ message: "Signup successful" });
    } catch (error) {
        console.log("Error in signup", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
       
    }
} 
