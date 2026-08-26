import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getTeamData() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    return { admins: [], invites: [] };
  }

  const [admins, invites] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
      orderBy: { email: "asc" },
    }),
    prisma.adminInvite.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return { admins, invites };
}
