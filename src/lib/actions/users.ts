"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/security";

export async function createAdminUser(formData: FormData) {
  await assertAdminSession();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const role = String(formData.get("role") ?? "admin").trim();

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "A user with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 6);

  await prisma.user.create({
    data: {
      name: name || email.split("@")[0],
      email,
      passwordHash,
      role,
    },
  });

  revalidatePath("/dashboard/admins");
  return { ok: true };
}

export async function deleteAdminUser(id: string) {
  await assertAdminSession();
  if (id === "admin-1") {
    return { ok: false, error: "The primary root admin account cannot be deleted." };
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/admins");
  return { ok: true };
}
