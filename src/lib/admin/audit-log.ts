import "server-only";
import { prisma } from "@/lib/prisma";


export async function logAdminAction(params: {
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  summary: string;
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorEmail: params.actorEmail,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        summary: params.summary,
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log", err);
  }
}

export function getAuditLog(limit = 100) {
  return prisma.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
}
