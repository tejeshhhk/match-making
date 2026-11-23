import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function proxy(request) {
  const session = await auth();

  if (!session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.user.id && request.nextUrl.pathname.startsWith("/tenders")) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.redirect(new URL("/profile?company=missing", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tenders/:path*", "/saved/:path*", "/alerts/:path*", "/profile/:path*"],
};
