import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";

const ForgotPasswordSchema = z.object({
  email: z.email().trim().toLowerCase(),
});

const TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Введите корректный email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });


  if (user) {
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      },
    });

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (error) {
      console.error("Failed to send password reset email", error);
    }
  }

  return NextResponse.json({ success: true });
}
