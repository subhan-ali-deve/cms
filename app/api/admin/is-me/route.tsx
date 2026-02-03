import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  console.log("is admin calling")
  console.log("session user id:", session.user.id);
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id);

    // s user ke saare roles lao, aur har role ka sirf name field do
  const isAdmin = data?.some(
    (r) => r.roles?.name === "admin"
  );

  return NextResponse.json({ isAdmin });
}
