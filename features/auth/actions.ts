"use server";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { redirect } from "next/navigation";

export async function registerAction(_: { error?: string } | undefined, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Periksa kembali nama, email, dan kata sandi Anda." };
  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "Email ini sudah terdaftar. Silakan masuk." };
  const role = await prisma.role.findUnique({ where: { key: "CUSTOMER" } });
  if (!role) return { error: "Konfigurasi peran belum tersedia. Jalankan seed database." };
  try { await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash: await hash(parsed.data.password, 12), roleId: role.id } }); }
  catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Email ini sudah terdaftar. Silakan masuk." }; throw error; }
  redirect("/login?registered=1");
  return {};
}
