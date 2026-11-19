import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function NavigationAuth() {
  await connection();
  const session = await auth();
  const name = session?.user?.name || "";
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "TM";

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1 text-sm font-medium">
        <Link className="nav-link" href="/login">Log in</Link>
        <Link className="primary-button" href="/signup">Get started</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
      <Link className="nav-link" href="/tenders">Matches</Link>
      <Link className="nav-link" href="/saved">Saved</Link>
      <Link className="nav-link" href="/alerts">Alerts</Link>
      <Link className="nav-avatar" href="/profile" aria-label="Open company profile">
        {initials}
      </Link>
      <LogoutButton />
    </div>
  );
}
