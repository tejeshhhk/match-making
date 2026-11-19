import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function getCurrentCompany() {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login?error=service");
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });
  } catch {
    redirect("/login?error=service");
  }

  if (!user) {
    redirect("/login?error=account");
  }

  if (!user.company) {
    redirect("/profile?company=missing");
  }

  return user.company;
}
