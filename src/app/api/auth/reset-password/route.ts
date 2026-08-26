import { NextResponse } from "next/server";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Минимум 8 символов"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ResetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "Ссылка недействительна или устарела" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
