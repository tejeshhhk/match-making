import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "TenderMatch",
  description: "Find government tenders matched to your business capabilities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
            <Link href="/tenders" className="text-xl font-bold tracking-tight text-[#2B39B8]">
              TenderMatch
            </Link>
            <div className="flex items-center gap-1 overflow-x-auto text-sm font-medium text-slate-600">
              <Link className="nav-link" href="/tenders">Matched tenders</Link>
              <Link className="nav-link" href="/saved">Saved</Link>
              <Link className="nav-link" href="/alerts">Alerts</Link>
              <Link className="nav-link" href="/profile">Company profile</Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
