import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tenders/:path*", "/saved/:path*", "/alerts/:path*", "/profile/:path*"],
};
