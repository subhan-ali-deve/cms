import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase/server";


export async function POST(req: Request) {
  // 1️⃣ Session check
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  //  Admin role check
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id);

  const isAdmin = roles?.some(
    (r) => r.roles?.name === "admin"
  );

  if (!isAdmin) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403 }
    );
  }

  //  Read body
  const { email, password, name, role } =
    await req.json();

  //  Create Supabase Auth user
  const { data: authUser, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,

    });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { message: authError?.message },
      { status: 400 }
    );
  }

  const userId = authUser.user.id;

  await supabaseAdmin.from("users").insert({
    // id: userId,
      name,
    email,
  });

  //  Get role id
  const { data: roleRow } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();

  if (!roleRow) {
    return NextResponse.json(
      { message: "Invalid role" },
      { status: 400 }
    );
  }

  //  Assign role
  await supabaseAdmin.from("user_roles").insert({
    user_id: userId,
    role_id: roleRow.id,
  });

  return NextResponse.json({
    message: "User created successfully",
  });
}
