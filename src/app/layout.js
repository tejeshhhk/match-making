import { Suspense } from "react";
import Link from "next/link";
import "./globals.css";
import NavigationAuth from "@/components/NavigationAuth";

export const metadata = {
  title: "TenderMatch",
  description: "Find government tenders matched to your business capabilities.",
};

function NavigationFallback() {
  return <div className="min-h-11 w-40" aria-hidden="true" />;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
          <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
            <Link href="/tenders" className="text-xl font-bold tracking-tight text-[#2B39B8]">
              TenderMatch
            </Link>
            <Suspense fallback={<NavigationFallback />}>
              <NavigationAuth />
            </Suspense>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
