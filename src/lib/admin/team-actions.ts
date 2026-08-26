"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin/audit-log";
import { sendAdminInviteEmail, sendRoleChangedEmail } from "@/lib/mailer";

async function getOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("host");
  return `${proto}://${host}`;
}

type ActionResult = { success: true } | { success: false; error: string };

async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN") {
    redirect("/");
  }
  return session;
}

const grantSchema = z.object({
  email: z.email("Введите корректный email").trim().toLowerCase(),
  role: z.enum(["ADMIN", "SUPERADMIN"]),
});


export async function grantRole(input: { email: string; role: "ADMIN" | "SUPERADMIN" }): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  const parsed = grantSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Проверьте email." };
  }
  const { email, role } = parsed.data;

  const origin = await getOrigin();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.user.update({ where: { email }, data: { role } });
    await prisma.adminInvite.deleteMany({ where: { email } });
    await logAdminAction({
      actorEmail: session.user.email!,
      action: "team.grant_role",
      targetType: "User",
      targetId: existingUser.id,
      summary: `Назначил роль ${role} пользователю ${email}`,
    });
    try {
      await sendRoleChangedEmail(email, role, `${origin}/admin`);
    } catch (error) {
      console.error("Failed to send role-changed email", error);
    }
  } else {
    await prisma.adminInvite.upsert({
      where: { email },
      update: { role, invitedBy: session.user.email! },
      create: { email, role, invitedBy: session.user.email! },
    });
    await logAdminAction({
      actorEmail: session.user.email!,
      action: "team.invite",
      targetType: "AdminInvite",
      summary: `Отправил приглашение с ролью ${role} на ${email}`,
    });
    try {
      await sendAdminInviteEmail(email, role, `${origin}/sign-in`);
    } catch (error) {
      console.error("Failed to send admin invite email", error);
    }
  }

  revalidatePath("/admin/team");
  return { success: true };
}

export async function revokeRole(userId: string): Promise<ActionResult> {
  const session = await requireSuperAdmin();

  if (userId === session.user.id) {
    return { success: false, error: "Нельзя снять права с самого себя." };
  }

  const user = await prisma.user.update({ where: { id: userId }, data: { role: "CUSTOMER" } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "team.revoke_role",
    targetType: "User",
    targetId: userId,
    summary: `Снял права админа с ${user.email}`,
  });

  revalidatePath("/admin/team");
  return { success: true };
}

export async function cancelInvite(inviteId: string): Promise<ActionResult> {
  const session = await requireSuperAdmin();
  const invite = await prisma.adminInvite.delete({ where: { id: inviteId } });

  await logAdminAction({
    actorEmail: session.user.email!,
    action: "team.cancel_invite",
    targetType: "AdminInvite",
    summary: `Отменил приглашение для ${invite.email}`,
  });

  revalidatePath("/admin/team");
  return { success: true };
}
