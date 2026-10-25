import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminsClient from "@/components/AdminsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admins & Users · Qreet CMS" };

export default async function AdminsPage() {
  const users = await prisma.user.findMany();

  const formatted = (users || []).map((u: any) => ({
    id: u.id,
    name: u.name || "User",
    email: u.email,
    role: u.role || "admin",
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return <AdminsClient initialUsers={formatted} />;
}
