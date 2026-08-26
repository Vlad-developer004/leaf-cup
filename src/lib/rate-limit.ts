import "server-only";
import { prisma } from "@/lib/prisma";

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number }
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= max) {
    return false;
  }

  await prisma.rateLimitHit.create({ data: { key } });

  prisma.rateLimitHit
    .deleteMany({ where: { key, createdAt: { lt: windowStart } } })
    .catch(() => {});

  return true;
}
