"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/cms/login" })}
      className="btn-ghost w-full justify-center text-xs"
    >
      Sign out
    </button>
  );
}
