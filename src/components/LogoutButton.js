"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      className="nav-logout"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Log out
    </button>
  );
}
