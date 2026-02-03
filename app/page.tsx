"use client";

import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div>
      {session ? (
        <p>Hello {session.user?.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
