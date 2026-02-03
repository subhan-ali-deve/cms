import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  console.log("admin layout session:", session);

  // 1️⃣ Login check
  if (!session) {
    redirect("/login");
  }

  // 2️⃣ Role check
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/admin/is-me`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    redirect("/");
  }

  const { isAdmin } = await res.json();

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div>
    
      {children}
    </div>
  );
}
