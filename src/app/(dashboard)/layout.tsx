import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import ResponsiveDashboardLayout from "@/components/ResponsiveDashboardLayout";

export const metadata: Metadata = { title: "Dashboard · Qreet CMS" };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <ResponsiveDashboardLayout userEmail={session?.user?.email}>
      {children}
    </ResponsiveDashboardLayout>
  );
}
