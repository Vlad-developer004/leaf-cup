import "server-only";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export async function consumeAdminInvite(userId: string, email: string): Promise<Role | null> {
  const invite = await prisma.adminInvite.findUnique({ where: { email } });
  if (!invite) return null;

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { role: invite.role } }),
    prisma.adminInvite.delete({ where: { email } }),
  ]);

  return invite.role;
}
