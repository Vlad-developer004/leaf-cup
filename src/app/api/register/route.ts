import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { consumeAdminInvite } from "@/lib/admin/admin-invites";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  firstName: z.string().trim().min(1, "Введите имя"),
  lastName: z.string().trim().min(1, "Введите фамилию"),
  email: z.email("Введите корректный email").trim().toLowerCase(),
  password: z.string().min(8, "Минимум 8 символов"),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`register:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });


  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
    });
    await consumeAdminInvite(user.id, email);
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
